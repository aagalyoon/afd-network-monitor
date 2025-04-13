#!/bin/bash
set -e

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== AFD Network Monitor Deployment Tool =====${NC}"
echo ""

# Detect OS
detect_os() {
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
  else
    OS=$(uname -s)
  fi
  echo -e "Detected OS: ${YELLOW}$OS${NC}"
}

# Function to check if MicroK8s is installed
check_microk8s() {
  if ! command -v microk8s >/dev/null 2>&1; then
    echo -e "${RED}MicroK8s is not installed.${NC}"
    echo "Please install MicroK8s first:"
    
    detect_os
    
    if [[ "$OS" == *"Fedora"* ]]; then
      echo "For Fedora:"
      echo "  1. Install Snap: sudo dnf install -y snapd"
      echo "  2. Enable Snap: sudo systemctl enable --now snapd.socket"
      echo "  3. Create Snap symlink: sudo ln -s /var/lib/snapd/snap /snap"
      echo "  4. Log out and log back in"
      echo "  5. Install MicroK8s: sudo snap install microk8s --classic"
      echo "  6. Add user to group: sudo usermod -aG microk8s \$USER"
      echo "  7. Apply group: newgrp microk8s"
      echo "  8. Set permissions: mkdir -p ~/.kube && sudo chown -f -R \$USER ~/.kube"
    elif [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
      echo "  - For Ubuntu/Debian: sudo snap install microk8s --classic"
    elif [[ "$OS" == *"macOS"* ]] || [[ "$OS" == *"Darwin"* ]]; then
      echo "  - For macOS: brew install ubuntu/microk8s/microk8s"
    else
      echo "  - Visit https://microk8s.io/docs/getting-started for installation instructions"
    fi
    
    exit 1
  fi
}

# Function to check if Docker is installed
check_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}Docker is not installed.${NC}"
    
    detect_os
    
    if [[ "$OS" == *"Fedora"* ]]; then
      echo "For Fedora:"
      echo "  1. Update system: sudo dnf update -y"
      echo "  2. Install required packages: sudo dnf install -y dnf-plugins-core"
      echo "  3. Add Docker repo: sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo"
      echo "  4. Install Docker: sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin"
      echo "  5. Start Docker: sudo systemctl start docker"
      echo "  6. Enable Docker: sudo systemctl enable docker"
      echo "  7. Add user to Docker group: sudo usermod -aG docker \$USER"
      echo "  8. Apply group: newgrp docker"
    elif [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
      echo "  - For Ubuntu/Debian: sudo apt-get update && sudo apt-get install -y docker.io"
    elif [[ "$OS" == *"macOS"* ]] || [[ "$OS" == *"Darwin"* ]]; then
      echo "  - For macOS: Visit https://docs.docker.com/desktop/install/mac-install/"
    else
      echo "  - Visit https://docs.docker.com/engine/install/ for installation instructions"
    fi
    
    exit 1
  fi
}

# Function to enable required MicroK8s addons
enable_addons() {
  echo -e "${YELLOW}Checking MicroK8s addons...${NC}"
  
  # Check if MicroK8s is running
  if ! microk8s status | grep -q "microk8s is running"; then
    echo -e "${YELLOW}Starting MicroK8s...${NC}"
    microk8s start
    sleep 5
  fi
  
  # Enable required addons if not already enabled
  ADDONS_TO_ENABLE=""
  
  if ! microk8s status | grep -q "dns: enabled"; then
    ADDONS_TO_ENABLE="$ADDONS_TO_ENABLE dns"
  fi
  
  if ! microk8s status | grep -q "ingress: enabled"; then
    ADDONS_TO_ENABLE="$ADDONS_TO_ENABLE ingress"
  fi
  
  if ! microk8s status | grep -q "registry: enabled"; then
    ADDONS_TO_ENABLE="$ADDONS_TO_ENABLE registry"
  fi
  
  if [ ! -z "$ADDONS_TO_ENABLE" ]; then
    echo -e "${YELLOW}Enabling required addons: $ADDONS_TO_ENABLE ${NC}"
    microk8s enable $ADDONS_TO_ENABLE
    sleep 5
  else
    echo -e "${GREEN}All required addons are already enabled.${NC}"
  fi
}

# Function to create Kubernetes manifests
create_k8s_manifests() {
  echo -e "${YELLOW}Creating Kubernetes manifests...${NC}"
  
  # Create directories if they don't exist
  mkdir -p k8s
  
  # Create namespace.yaml
  cat > k8s/namespace.yaml << EOF
apiVersion: v1
kind: Namespace
metadata:
  name: afd-network-monitor
EOF
  
  # Create deployment.yaml
  cat > k8s/deployment.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: afd-network-monitor
  namespace: afd-network-monitor
spec:
  replicas: 1
  selector:
    matchLabels:
      app: afd-network-monitor
  template:
    metadata:
      labels:
        app: afd-network-monitor
    spec:
      containers:
      - name: afd-network-monitor
        image: localhost:32000/afd-network-monitor:latest
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: "0.5"
            memory: "512Mi"
          requests:
            cpu: "0.2"
            memory: "256Mi"
EOF
  
  # Create service.yaml with NodePort 32085
  cat > k8s/service.yaml << EOF
apiVersion: v1
kind: Service
metadata:
  name: afd-network-monitor
  namespace: afd-network-monitor
spec:
  selector:
    app: afd-network-monitor
  ports:
  - port: 80
    targetPort: 80
    nodePort: 32085
  type: NodePort
EOF
  
  # Create ingress.yaml
  cat > k8s/ingress.yaml << EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: afd-network-monitor
  namespace: afd-network-monitor
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: afd-network-monitor.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: afd-network-monitor
            port:
              number: 80
EOF

  echo -e "${GREEN}Kubernetes manifests created successfully.${NC}"
}

# Function to deploy to MicroK8s
deploy_to_microk8s() {
  echo -e "${YELLOW}Deploying to MicroK8s...${NC}"
  
  # Tag the image for the MicroK8s registry
  echo -e "${YELLOW}Tagging image for MicroK8s registry...${NC}"
  docker tag afd-network-monitor:latest localhost:32000/afd-network-monitor:latest
  
  # Push the image to the MicroK8s registry
  echo -e "${YELLOW}Pushing image to MicroK8s registry...${NC}"
  docker push localhost:32000/afd-network-monitor:latest
  
  # Apply Kubernetes manifests
  echo -e "${YELLOW}Applying Kubernetes manifests...${NC}"
  microk8s kubectl apply -f k8s/namespace.yaml
  microk8s kubectl apply -f k8s/deployment.yaml
  microk8s kubectl apply -f k8s/service.yaml
  microk8s kubectl apply -f k8s/ingress.yaml
  
  echo -e "${GREEN}Deployment to MicroK8s completed successfully.${NC}"
}

# Function to deploy to Docker
deploy_to_docker() {
  echo -e "${YELLOW}Deploying to Docker...${NC}"
  
  # Check if container already exists
  if docker ps -a | grep -q afd-network-monitor; then
    echo -e "${YELLOW}Container 'afd-network-monitor' already exists.${NC}"
    
    # Stop and remove the container
    echo -e "${YELLOW}Stopping and removing existing container...${NC}"
    docker stop afd-network-monitor 2>/dev/null || true
    docker rm afd-network-monitor 2>/dev/null || true
  fi
  
  # Run the container
  echo -e "${YELLOW}Running container on port 32085...${NC}"
  docker run -d --name afd-network-monitor \
    -p 32085:80 \
    --restart unless-stopped \
    afd-network-monitor:latest
  
  echo -e "${GREEN}Deployment to Docker completed successfully.${NC}"
}

# Function to check firewall for Fedora
check_firewall_fedora() {
  if command -v firewall-cmd >/dev/null 2>&1; then
    echo -e "${YELLOW}Checking firewall settings...${NC}"
    
    # Check if port 32085 is open
    if ! sudo firewall-cmd --list-ports | grep -q "32085/tcp"; then
      echo -e "${YELLOW}Port 32085 is not open in the firewall. Opening it now...${NC}"
      sudo firewall-cmd --add-port=32085/tcp --permanent
      sudo firewall-cmd --reload
      echo -e "${GREEN}Port 32085 opened successfully.${NC}"
    else
      echo -e "${GREEN}Port 32085 is already open in the firewall.${NC}"
    fi
  fi
}

# Main execution
main() {
  # Check prerequisites
  check_docker
  
  # Build the Docker image
  echo -e "${YELLOW}Building Docker image...${NC}"
  docker build -t afd-network-monitor:latest .
  
  # Deploy based on user choice
  echo ""
  echo "Select deployment option:"
  echo "1) Deploy to Docker only (port 32085)"
  echo "2) Deploy to MicroK8s only (port 32085)"
  echo "3) Deploy to both Docker and MicroK8s (port 32085)"
  echo ""
  read -p "Enter your choice (1-3): " choice
  
  case $choice in
    1)
      deploy_to_docker
      ;;
    2)
      check_microk8s
      enable_addons
      create_k8s_manifests
      deploy_to_microk8s
      ;;
    3)
      check_microk8s
      enable_addons
      create_k8s_manifests
      deploy_to_microk8s
      deploy_to_docker
      ;;
    *)
      echo -e "${RED}Invalid choice. Exiting.${NC}"
      exit 1
      ;;
  esac
  
  # Check and configure firewall for Fedora
  detect_os
  if [[ "$OS" == *"Fedora"* ]]; then
    check_firewall_fedora
  fi
  
  # Get the local IP address
  LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "your-machine-ip")
  
  echo ""
  echo -e "${GREEN}Deployment completed successfully!${NC}"
  echo ""
  echo -e "${YELLOW}Access options:${NC}"
  
  if [ "$choice" == "1" ] || [ "$choice" == "3" ]; then
    echo "1. Docker: http://localhost:32085 or http://$LOCAL_IP:32085"
  fi
  
  if [ "$choice" == "2" ] || [ "$choice" == "3" ]; then
    echo "2. MicroK8s NodePort: http://$LOCAL_IP:32085"
    echo "3. MicroK8s Ingress (requires hosts file entry):"
    echo "   Add the following entry to your /etc/hosts file:"
    echo "   127.0.0.1 afd-network-monitor.local"
    echo "   Then access the application at http://afd-network-monitor.local"
  fi
  
  echo ""
  echo -e "${YELLOW}Useful commands:${NC}"
  echo "- View Docker logs: docker logs afd-network-monitor"
  echo "- View MicroK8s logs: microk8s kubectl logs -n afd-network-monitor deployment/afd-network-monitor"
  echo "- Check deployment status: ./deploy.sh status"
}

# Function to check status
check_status() {
  echo -e "${GREEN}===== AFD Network Monitor Status =====${NC}"
  echo ""
  
  # Check Docker status
  echo -e "${YELLOW}Docker Status:${NC}"
  if docker ps | grep -q afd-network-monitor; then
    echo -e "${GREEN}✓ Docker container is running${NC}"
    docker ps | grep afd-network-monitor
  else
    echo -e "${RED}✗ Docker container is not running${NC}"
  fi
  
  echo ""
  
  # Check MicroK8s status if installed
  if command -v microk8s >/dev/null 2>&1; then
    echo -e "${YELLOW}MicroK8s Status:${NC}"
    if microk8s status | grep -q "microk8s is running"; then
      echo -e "${GREEN}✓ MicroK8s is running${NC}"
      
      # Check namespace
      if microk8s kubectl get ns | grep -q afd-network-monitor; then
        echo -e "${GREEN}✓ Namespace exists${NC}"
        
        # Check deployment
        echo ""
        echo "Deployment status:"
        microk8s kubectl get deployments -n afd-network-monitor 2>/dev/null || echo -e "${RED}✗ No deployments found${NC}"
        
        # Check service
        echo ""
        echo "Service status:"
        microk8s kubectl get svc -n afd-network-monitor 2>/dev/null || echo -e "${RED}✗ No services found${NC}"
        
        # Check pods
        echo ""
        echo "Pod status:"
        microk8s kubectl get pods -n afd-network-monitor 2>/dev/null || echo -e "${RED}✗ No pods found${NC}"
      else
        echo -e "${RED}✗ Namespace 'afd-network-monitor' does not exist${NC}"
      fi
    else
      echo -e "${RED}✗ MicroK8s is not running${NC}"
    fi
  else
    echo -e "${YELLOW}MicroK8s is not installed${NC}"
  fi
}

# Check if the script is called with the status parameter
if [ "$1" == "status" ]; then
  check_status
else
  main
fi 