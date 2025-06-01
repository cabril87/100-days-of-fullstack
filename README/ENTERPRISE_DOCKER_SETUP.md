# 🏢 Enterprise Docker Setup Guide
## TaskTracker Application - Production Deployment with Ansible

> **Enterprise-grade deployment strategy for small to medium organizations**
> 
> This guide covers the complete infrastructure setup using Ansible automation, Docker containerization, Kubernetes for high availability, and enterprise storage solutions.

---

## 📋 **Infrastructure Overview**

### **Technology Stack**
- **Orchestration**: Ansible (Infrastructure as Code)
- **Containerization**: Docker & Docker Compose
- **High Availability**: Kubernetes (when needed)
- **Version Control**: Git (Ansible playbooks)
- **Storage**: SAN (Storage Area Network)
- **Backup**: Enterprise backup solution with SAN integration
- **Monitoring**: Prometheus, Grafana, ELK Stack

### **Deployment Patterns**
1. **Single Instance**: Docker Compose on single host (development/staging)
2. **High Availability**: Kubernetes cluster (production)
3. **Disaster Recovery**: Ansible playbook restoration

---

## 🏗️ **Project Structure**

```
tasktracker-infrastructure/
├── ansible/
│   ├── inventories/
│   │   ├── development/
│   │   │   ├── hosts.yml
│   │   │   └── group_vars/
│   │   ├── staging/
│   │   │   ├── hosts.yml
│   │   │   └── group_vars/
│   │   └── production/
│   │       ├── hosts.yml
│   │       └── group_vars/
│   ├── playbooks/
│   │   ├── site.yml
│   │   ├── docker-setup.yml
│   │   ├── k8s-setup.yml
│   │   ├── app-deploy.yml
│   │   └── backup-restore.yml
│   ├── roles/
│   │   ├── common/
│   │   ├── docker/
│   │   ├── kubernetes/
│   │   ├── tasktracker/
│   │   ├── monitoring/
│   │   └── backup/
│   ├── templates/
│   │   ├── docker-compose/
│   │   ├── kubernetes/
│   │   └── nginx/
│   └── ansible.cfg
├── docker/
│   ├── production/
│   │   ├── docker-compose.yml
│   │   ├── .env.production
│   │   └── nginx/
│   ├── staging/
│   │   ├── docker-compose.yml
│   │   └── .env.staging
│   └── Dockerfile.*
├── kubernetes/
│   ├── namespaces/
│   ├── deployments/
│   ├── services/
│   ├── ingress/
│   ├── storage/
│   └── monitoring/
├── scripts/
│   ├── deploy.sh
│   ├── backup.sh
│   └── restore.sh
└── docs/
    ├── runbooks/
    ├── troubleshooting/
    └── architecture/
```

---

## 🚀 **Quick Start Guide**

### **Prerequisites**
```bash
# Control machine requirements
sudo apt update
sudo apt install -y ansible git python3 python3-pip
pip3 install docker kubernetes

# Clone infrastructure repository
git clone https://github.com/your-org/tasktracker-infrastructure.git
cd tasktracker-infrastructure/ansible
```

### **Initial Setup Commands**
```bash
# 1. Configure target hosts
ansible-playbook -i inventories/production/hosts.yml playbooks/docker-setup.yml

# 2. Deploy single instance (staging)
ansible-playbook -i inventories/staging/hosts.yml playbooks/app-deploy.yml

# 3. Deploy HA cluster (production)
ansible-playbook -i inventories/production/hosts.yml playbooks/k8s-setup.yml
ansible-playbook -i inventories/production/hosts.yml playbooks/app-deploy.yml --tags k8s
```

---

## 🔧 **Ansible Configuration**

### **Inventory Structure**

#### **Production Hosts (`inventories/production/hosts.yml`)**
```yaml
all:
  children:
    docker_hosts:
      hosts:
        docker-01.company.com:
          ansible_host: 10.0.1.10
          docker_role: manager
        docker-02.company.com:
          ansible_host: 10.0.1.11
          docker_role: worker
        docker-03.company.com:
          ansible_host: 10.0.1.12
          docker_role: worker
      vars:
        ansible_user: ansible
        ansible_ssh_private_key_file: ~/.ssh/ansible_rsa
        
    k8s_masters:
      hosts:
        k8s-master-01.company.com:
          ansible_host: 10.0.2.10
        k8s-master-02.company.com:
          ansible_host: 10.0.2.11
        k8s-master-03.company.com:
          ansible_host: 10.0.2.12
          
    k8s_workers:
      hosts:
        k8s-worker-01.company.com:
          ansible_host: 10.0.2.20
        k8s-worker-02.company.com:
          ansible_host: 10.0.2.21
        k8s-worker-03.company.com:
          ansible_host: 10.0.2.22
          
    database_hosts:
      hosts:
        db-01.company.com:
          ansible_host: 10.0.3.10
          db_role: primary
        db-02.company.com:
          ansible_host: 10.0.3.11
          db_role: replica
          
    storage_hosts:
      hosts:
        san-01.company.com:
          ansible_host: 10.0.4.10
          storage_type: primary
        san-02.company.com:
          ansible_host: 10.0.4.11
          storage_type: backup
```

#### **Group Variables (`inventories/production/group_vars/all.yml`)**
```yaml
---
# Application Configuration
app_name: tasktracker
app_version: "{{ app_version | default('latest') }}"
app_domain: tasktracker.company.com

# Docker Configuration
docker_compose_version: "2.20.0"
docker_network: tasktracker_network
docker_data_dir: /opt/tasktracker

# Database Configuration
database_host: db-01.company.com
database_name: TaskTracker
database_backup_schedule: "0 2 * * *"

# Storage Configuration
san_mount_point: /mnt/san
nfs_server: san-01.company.com
nfs_path: /exports/tasktracker

# SSL Configuration
ssl_cert_path: /etc/ssl/certs/tasktracker.crt
ssl_key_path: /etc/ssl/private/tasktracker.key

# Monitoring
monitoring_enabled: true
log_aggregation: true
metrics_retention: 30d

# Backup Configuration
backup_enabled: true
backup_retention: 90d
backup_schedule: "0 3 * * 0"
```

---

## 🐳 **Docker Host Setup**

### **Main Docker Setup Playbook (`playbooks/docker-setup.yml`)**
```yaml
---
- name: Setup Docker Hosts
  hosts: docker_hosts
  become: yes
  
  pre_tasks:
    - name: Update package cache
      apt:
        update_cache: yes
        cache_valid_time: 3600
      when: ansible_os_family == "Debian"

  roles:
    - common
    - docker
    - monitoring
    - backup

  post_tasks:
    - name: Verify Docker installation
      docker_info:
      register: docker_info
      
    - name: Display Docker version
      debug:
        msg: "Docker version: {{ docker_info.docker_version }}"
```

### **Docker Role (`roles/docker/tasks/main.yml`)**
```yaml
---
- name: Install Docker dependencies
  apt:
    name:
      - apt-transport-https
      - ca-certificates
      - curl
      - gnupg
      - lsb-release
    state: present

- name: Add Docker GPG key
  apt_key:
    url: https://download.docker.com/linux/ubuntu/gpg
    state: present

- name: Add Docker repository
  apt_repository:
    repo: "deb [arch=amd64] https://download.docker.com/linux/ubuntu {{ ansible_distribution_release }} stable"
    state: present

- name: Install Docker
  apt:
    name:
      - docker-ce
      - docker-ce-cli
      - containerd.io
      - docker-compose-plugin
    state: present
    update_cache: yes

- name: Start and enable Docker
  systemd:
    name: docker
    state: started
    enabled: yes

- name: Add users to docker group
  user:
    name: "{{ item }}"
    groups: docker
    append: yes
  loop:
    - "{{ ansible_user }}"
    - ubuntu

- name: Install Docker Compose
  get_url:
    url: "https://github.com/docker/compose/releases/download/v{{ docker_compose_version }}/docker-compose-{{ ansible_system }}-{{ ansible_architecture }}"
    dest: /usr/local/bin/docker-compose
    mode: '0755'

- name: Create application directory
  file:
    path: "{{ docker_data_dir }}"
    state: directory
    owner: "{{ ansible_user }}"
    group: docker
    mode: '0755'

- name: Configure Docker daemon
  template:
    src: daemon.json.j2
    dest: /etc/docker/daemon.json
  notify: restart docker

- name: Setup log rotation
  template:
    src: docker-logrotate.j2
    dest: /etc/logrotate.d/docker
```

### **Docker Daemon Configuration (`roles/docker/templates/daemon.json.j2`)**
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "live-restore": true,
  "userland-proxy": false,
  "experimental": false,
  "metrics-addr": "0.0.0.0:9323",
  "insecure-registries": ["{{ docker_registry | default('registry.company.com') }}"]
}
```

---

## ☸️ **Kubernetes High Availability Setup**

### **Kubernetes Setup Playbook (`playbooks/k8s-setup.yml`)**
```yaml
---
- name: Setup Kubernetes Masters
  hosts: k8s_masters
  become: yes
  serial: 1
  
  roles:
    - common
    - kubernetes/master
    
- name: Setup Kubernetes Workers
  hosts: k8s_workers
  become: yes
  
  roles:
    - common
    - kubernetes/worker

- name: Deploy TaskTracker to Kubernetes
  hosts: k8s_masters[0]
  become: no
  
  tasks:
    - name: Apply namespace
      kubernetes.core.k8s:
        state: present
        definition:
          apiVersion: v1
          kind: Namespace
          metadata:
            name: tasktracker
            
    - name: Deploy application manifests
      kubernetes.core.k8s:
        state: present
        src: "{{ item }}"
        namespace: tasktracker
      loop:
        - "{{ playbook_dir }}/../kubernetes/deployments/tasktracker-api.yml"
        - "{{ playbook_dir }}/../kubernetes/deployments/tasktracker-frontend.yml"
        - "{{ playbook_dir }}/../kubernetes/services/"
        - "{{ playbook_dir }}/../kubernetes/ingress/"
```

### **Kubernetes Deployment (`kubernetes/deployments/tasktracker-api.yml`)**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tasktracker-api
  namespace: tasktracker
  labels:
    app: tasktracker-api
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tasktracker-api
  template:
    metadata:
      labels:
        app: tasktracker-api
    spec:
      containers:
      - name: api
        image: registry.company.com/tasktracker/api:{{ app_version }}
        ports:
        - containerPort: 8080
        env:
        - name: ASPNETCORE_ENVIRONMENT
          value: "Production"
        - name: ConnectionStrings__DefaultConnection
          valueFrom:
            secretKeyRef:
              name: tasktracker-secrets
              key: database-connection
        resources:
          requests:
            memory: "512Mi"
            cpu: "200m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: app-data
          mountPath: /app/data
      volumes:
      - name: app-data
        persistentVolumeClaim:
          claimName: tasktracker-api-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: tasktracker-api-service
  namespace: tasktracker
spec:
  selector:
    app: tasktracker-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: ClusterIP
```

---

## 💾 **Storage & Backup Strategy**

### **SAN Storage Configuration**

#### **Storage Setup (`roles/storage/tasks/main.yml`)**
```yaml
---
- name: Install NFS utilities
  apt:
    name:
      - nfs-common
      - nfs-kernel-server
    state: present

- name: Create mount point
  file:
    path: "{{ san_mount_point }}"
    state: directory
    mode: '0755'

- name: Mount SAN storage
  mount:
    path: "{{ san_mount_point }}"
    src: "{{ nfs_server }}:{{ nfs_path }}"
    fstype: nfs
    opts: rw,hard,intr
    state: mounted

- name: Create application data directories
  file:
    path: "{{ san_mount_point }}/{{ item }}"
    state: directory
    mode: '0755'
  loop:
    - tasktracker/database
    - tasktracker/uploads
    - tasktracker/logs
    - tasktracker/backups

- name: Setup backup script
  template:
    src: backup.sh.j2
    dest: /usr/local/bin/tasktracker-backup.sh
    mode: '0755'

- name: Schedule backups
  cron:
    name: "TaskTracker Backup"
    minute: "0"
    hour: "3"
    weekday: "0"
    job: "/usr/local/bin/tasktracker-backup.sh"
    user: root
```

#### **Backup Script (`roles/storage/templates/backup.sh.j2`)**
```bash
#!/bin/bash
set -euo pipefail

# Configuration
BACKUP_DIR="{{ san_mount_point }}/tasktracker/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS={{ backup_retention | regex_replace('d', '') }}

# Create backup directory
mkdir -p "$BACKUP_DIR/$DATE"

# Database backup
echo "Starting database backup..."
docker exec tasktracker-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "$SQLSERVER_SA_PASSWORD" \
  -Q "BACKUP DATABASE [TaskTracker] TO DISK = '/backup/tasktracker_$DATE.bak'"

# Application data backup
echo "Starting application data backup..."
rsync -av {{ docker_data_dir }}/ "$BACKUP_DIR/$DATE/app-data/"

# Log backup
echo "Starting log backup..."
docker logs tasktracker-api > "$BACKUP_DIR/$DATE/api.log" 2>&1
docker logs tasktracker-frontend > "$BACKUP_DIR/$DATE/frontend.log" 2>&1

# Compress backup
echo "Compressing backup..."
cd "$BACKUP_DIR"
tar -czf "tasktracker_$DATE.tar.gz" "$DATE"
rm -rf "$DATE"

# Cleanup old backups
echo "Cleaning up old backups..."
find "$BACKUP_DIR" -name "tasktracker_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: tasktracker_$DATE.tar.gz"

# Send notification
curl -X POST "{{ slack_webhook_url | default('') }}" \
  -H 'Content-type: application/json' \
  --data '{"text":"TaskTracker backup completed: tasktracker_'$DATE'.tar.gz"}' || true
```

---

## 🚀 **Application Deployment**

### **Single Instance Deployment (`playbooks/app-deploy.yml`)**
```yaml
---
- name: Deploy TaskTracker Application
  hosts: docker_hosts
  become: yes
  
  vars:
    app_env: "{{ target_env | default('production') }}"
    
  tasks:
    - name: Create application directory
      file:
        path: "{{ docker_data_dir }}"
        state: directory
        owner: "{{ ansible_user }}"
        group: docker
        mode: '0755'

    - name: Copy Docker Compose file
      template:
        src: "docker-compose.{{ app_env }}.yml.j2"
        dest: "{{ docker_data_dir }}/docker-compose.yml"
      notify: restart application

    - name: Copy environment file
      template:
        src: ".env.{{ app_env }}.j2"
        dest: "{{ docker_data_dir }}/.env"
        mode: '0600'
      notify: restart application

    - name: Pull latest images
      docker_image:
        name: "{{ item }}"
        source: pull
        force_source: yes
      loop:
        - "{{ docker_registry }}/tasktracker/api:{{ app_version }}"
        - "{{ docker_registry }}/tasktracker/frontend:{{ app_version }}"
        - mcr.microsoft.com/mssql/server:2022-latest

    - name: Start application
      docker_compose:
        project_src: "{{ docker_data_dir }}"
        state: present
        services:
          - tasktracker-api
          - tasktracker-frontend
          - tasktracker-sqlserver
        pull: yes

    - name: Wait for application to be ready
      uri:
        url: "http://{{ ansible_host }}:3000/health"
        method: GET
        status_code: 200
      retries: 30
      delay: 10

  handlers:
    - name: restart application
      docker_compose:
        project_src: "{{ docker_data_dir }}"
        restarted: yes
```

### **Production Docker Compose Template (`templates/docker-compose.production.yml.j2`)**
```yaml
version: '3.8'

networks:
  tasktracker:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  sqlserver_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: {{ san_mount_point }}/tasktracker/database
  app_uploads:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: {{ san_mount_point }}/tasktracker/uploads

services:
  tasktracker-sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: tasktracker-sqlserver
    environment:
      SA_PASSWORD: "${SQLSERVER_SA_PASSWORD}"
      ACCEPT_EULA: "Y"
      MSSQL_PID: "Express"
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql
      - {{ san_mount_point }}/tasktracker/backups:/backup
    networks:
      - tasktracker
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $$SA_PASSWORD -Q 'SELECT 1' || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  tasktracker-api:
    image: {{ docker_registry }}/tasktracker/api:{{ app_version }}
    container_name: tasktracker-api
    environment:
      ASPNETCORE_ENVIRONMENT: "Production"
      ConnectionStrings__DefaultConnection: "${DATABASE_CONNECTION_STRING}"
      JwtSettings__SecretKey: "${JWT_SECRET_KEY}"
      JwtSettings__Issuer: "{{ app_domain }}"
      JwtSettings__Audience: "{{ app_domain }}"
    ports:
      - "8080:8080"
    volumes:
      - app_uploads:/app/uploads
      - {{ docker_data_dir }}/logs:/app/logs
    networks:
      - tasktracker
    depends_on:
      tasktracker-sqlserver:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  tasktracker-frontend:
    image: {{ docker_registry }}/tasktracker/frontend:{{ app_version }}
    container_name: tasktracker-frontend
    environment:
      NEXT_PUBLIC_API_URL: "https://{{ app_domain }}/api"
      NODE_ENV: "production"
    ports:
      - "3000:3000"
    networks:
      - tasktracker
    depends_on:
      - tasktracker-api
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  nginx:
    image: nginx:alpine
    container_name: tasktracker-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - {{ ssl_cert_path }}:/etc/ssl/certs/tasktracker.crt:ro
      - {{ ssl_key_path }}:/etc/ssl/private/tasktracker.key:ro
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    networks:
      - tasktracker
    depends_on:
      - tasktracker-frontend
      - tasktracker-api
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 🔄 **Disaster Recovery**

### **Complete Host Restoration**

#### **Restore Playbook (`playbooks/backup-restore.yml`)**
```yaml
---
- name: Restore TaskTracker from Backup
  hosts: docker_hosts
  become: yes
  
  vars_prompt:
    - name: backup_file
      prompt: "Enter backup file name (e.g., tasktracker_20240101_030000.tar.gz)"
      private: no
    
  tasks:
    - name: Stop existing application
      docker_compose:
        project_src: "{{ docker_data_dir }}"
        state: absent
      ignore_errors: yes

    - name: Extract backup
      unarchive:
        src: "{{ san_mount_point }}/tasktracker/backups/{{ backup_file }}"
        dest: /tmp/
        remote_src: yes

    - name: Restore application data
      rsync:
        src: "/tmp/{{ backup_file | regex_replace('.tar.gz', '') }}/app-data/"
        dest: "{{ docker_data_dir }}/"
        delete: yes

    - name: Restore database
      shell: |
        docker run --rm -v {{ san_mount_point }}/tasktracker/database:/var/opt/mssql \
          -v /tmp/{{ backup_file | regex_replace('.tar.gz', '') }}:/backup \
          mcr.microsoft.com/mssql/server:2022-latest \
          /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SQLSERVER_SA_PASSWORD" \
          -Q "RESTORE DATABASE [TaskTracker] FROM DISK = '/backup/tasktracker_*.bak'"

    - name: Start application
      docker_compose:
        project_src: "{{ docker_data_dir }}"
        state: present

    - name: Verify application health
      uri:
        url: "http://{{ ansible_host }}:3000/health"
        method: GET
        status_code: 200
      retries: 30
      delay: 10
```

### **Emergency Procedures**

#### **Quick Recovery Script (`scripts/emergency-restore.sh`)**
```bash
#!/bin/bash
set -euo pipefail

# Emergency restore script for TaskTracker
# Usage: ./emergency-restore.sh <backup-file> <target-host>

BACKUP_FILE="$1"
TARGET_HOST="${2:-docker-01.company.com}"

echo "🚨 Emergency restore initiated"
echo "Backup: $BACKUP_FILE"
echo "Target: $TARGET_HOST"

# Stop application
echo "Stopping application on $TARGET_HOST..."
ansible -i inventories/production/hosts.yml "$TARGET_HOST" \
  -m shell -a "cd {{ docker_data_dir }} && docker-compose down"

# Restore from backup
echo "Restoring from backup..."
ansible-playbook -i inventories/production/hosts.yml playbooks/backup-restore.yml \
  --limit "$TARGET_HOST" \
  --extra-vars "backup_file=$BACKUP_FILE"

echo "✅ Emergency restore completed"
echo "Application should be available at: https://$TARGET_HOST"
```

---

## 📊 **Monitoring & Alerting**

### **Prometheus Configuration**
```yaml
# roles/monitoring/templates/prometheus.yml.j2
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

rule_files:
  - "tasktracker_alerts.yml"

scrape_configs:
  - job_name: 'docker-hosts'
    static_configs:
      - targets:
{% for host in groups['docker_hosts'] %}
        - {{ hostvars[host]['ansible_host'] }}:9323
{% endfor %}

  - job_name: 'tasktracker-api'
    static_configs:
      - targets:
{% for host in groups['docker_hosts'] %}
        - {{ hostvars[host]['ansible_host'] }}:8080
{% endfor %}
    metrics_path: /metrics

  - job_name: 'node-exporter'
    static_configs:
      - targets:
{% for host in groups['all'] %}
        - {{ hostvars[host]['ansible_host'] }}:9100
{% endfor %}
```

### **Alert Rules (`roles/monitoring/templates/tasktracker_alerts.yml.j2`)**
```yaml
groups:
  - name: tasktracker
    rules:
      - alert: ApplicationDown
        expr: up{job="tasktracker-api"} == 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "TaskTracker API is down"
          description: "TaskTracker API has been down for more than 5 minutes"

      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes{name=~"tasktracker.*"} / container_spec_memory_limit_bytes > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage in TaskTracker container"
          description: "Container {{ $labels.name }} is using over 80% of allocated memory"

      - alert: DatabaseConnectionFailed
        expr: tasktracker_database_connections_failed_total > 10
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failures"
          description: "TaskTracker is experiencing database connection issues"

      - alert: DiskSpaceLow
        expr: node_filesystem_avail_bytes{mountpoint="{{ san_mount_point }}"} / node_filesystem_size_bytes < 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Low disk space on SAN storage"
          description: "SAN storage has less than 10% free space remaining"
```

---

## 🛡️ **Security Best Practices**

### **Security Hardening Checklist**

#### **Host Security (`roles/security/tasks/main.yml`)**
```yaml
---
- name: Update all packages
  apt:
    upgrade: dist
    update_cache: yes

- name: Install security packages
  apt:
    name:
      - fail2ban
      - ufw
      - unattended-upgrades
      - aide
    state: present

- name: Configure firewall
  ufw:
    rule: "{{ item.rule }}"
    port: "{{ item.port }}"
    proto: "{{ item.proto }}"
  loop:
    - { rule: "allow", port: "22", proto: "tcp" }
    - { rule: "allow", port: "80", proto: "tcp" }
    - { rule: "allow", port: "443", proto: "tcp" }
    - { rule: "allow", port: "2376", proto: "tcp" }  # Docker daemon
    - { rule: "allow", port: "6443", proto: "tcp" }  # Kubernetes API

- name: Enable firewall
  ufw:
    state: enabled

- name: Configure fail2ban
  template:
    src: jail.local.j2
    dest: /etc/fail2ban/jail.local
  notify: restart fail2ban

- name: Setup automatic security updates
  template:
    src: 50unattended-upgrades.j2
    dest: /etc/apt/apt.conf.d/50unattended-upgrades

- name: Configure SSH hardening
  lineinfile:
    path: /etc/ssh/sshd_config
    regexp: "{{ item.regexp }}"
    line: "{{ item.line }}"
  loop:
    - { regexp: "^#?PermitRootLogin", line: "PermitRootLogin no" }
    - { regexp: "^#?PasswordAuthentication", line: "PasswordAuthentication no" }
    - { regexp: "^#?X11Forwarding", line: "X11Forwarding no" }
    - { regexp: "^#?MaxAuthTries", line: "MaxAuthTries 3" }
  notify: restart ssh
```

---

## 📚 **Operational Runbooks**

### **Common Operations**

#### **Deploy New Version**
```bash
# Update version in git
git tag v1.2.3
git push origin v1.2.3

# Deploy to staging
ansible-playbook -i inventories/staging/hosts.yml playbooks/app-deploy.yml \
  --extra-vars "app_version=v1.2.3"

# Smoke test staging
curl -f https://staging.tasktracker.company.com/health

# Deploy to production
ansible-playbook -i inventories/production/hosts.yml playbooks/app-deploy.yml \
  --extra-vars "app_version=v1.2.3"
```

#### **Scale Application**
```bash
# Scale Docker Compose (single instance)
docker-compose up -d --scale tasktracker-api=3

# Scale Kubernetes deployment
kubectl scale deployment tasktracker-api --replicas=5 -n tasktracker
```

#### **Rolling Updates**
```bash
# Kubernetes rolling update
kubectl set image deployment/tasktracker-api api=registry.company.com/tasktracker/api:v1.2.3 -n tasktracker
kubectl rollout status deployment/tasktracker-api -n tasktracker

# Rollback if needed
kubectl rollout undo deployment/tasktracker-api -n tasktracker
```

#### **Database Maintenance**
```bash
# Create manual backup
ansible-playbook -i inventories/production/hosts.yml playbooks/backup.yml

# Database index rebuild
docker exec tasktracker-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "$SQLSERVER_SA_PASSWORD" \
  -Q "ALTER INDEX ALL ON [TaskTracker].[dbo].[Tasks] REBUILD"

# Database statistics update
docker exec tasktracker-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "$SQLSERVER_SA_PASSWORD" \
  -Q "UPDATE STATISTICS [TaskTracker].[dbo].[Tasks]"
```

---

## 🔍 **Troubleshooting Guide**

### **Common Issues**

#### **Application Won't Start**
```bash
# Check container logs
docker logs tasktracker-api
docker logs tasktracker-frontend

# Check system resources
docker stats
df -h
free -m

# Restart services
docker-compose restart

# Full reset
docker-compose down && docker-compose up -d
```

#### **Database Connection Issues**
```bash
# Test database connectivity
docker exec tasktracker-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "$SQLSERVER_SA_PASSWORD" \
  -Q "SELECT 1"

# Check database locks
docker exec tasktracker-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "$SQLSERVER_SA_PASSWORD" \
  -Q "SELECT * FROM sys.dm_exec_requests WHERE blocking_session_id <> 0"

# Restart database
docker restart tasktracker-sqlserver
```

#### **Storage Issues**
```bash
# Check SAN mount
mount | grep tasktracker
df -h /mnt/san

# Remount if needed
umount /mnt/san/tasktracker
mount -a

# Check NFS server
showmount -e san-01.company.com
```

---

## 📝 **Change Management**

### **Git Workflow**
```bash
# Feature development
git checkout -b feature/new-deployment-strategy
# Make changes
git commit -m "Add blue-green deployment strategy"
git push origin feature/new-deployment-strategy

# Create pull request, review, merge to main

# Deploy changes
git checkout main
git pull origin main
ansible-playbook -i inventories/production/hosts.yml site.yml --check
ansible-playbook -i inventories/production/hosts.yml site.yml
```

### **Version Control Structure**
```
git-repo/
├── .github/
│   └── workflows/
│       ├── ansible-lint.yml
│       ├── terraform-plan.yml
│       └── security-scan.yml
├── ansible/
├── terraform/
├── docs/
└── CHANGELOG.md
```

---

## 🎯 **Performance Optimization**

### **Resource Allocation**
```yaml
# Kubernetes resource limits
resources:
  requests:
    memory: "512Mi"
    cpu: "200m"
  limits:
    memory: "1Gi"
    cpu: "500m"
```

### **Database Optimization**
```sql
-- Index optimization
CREATE INDEX IX_Tasks_UserId_Status ON Tasks(UserId, Status) 
WHERE IsDeleted = 0;

-- Query optimization
UPDATE STATISTICS Tasks WITH FULLSCAN;

-- Memory allocation
sp_configure 'max server memory', 8192;
RECONFIGURE;
```

---

## 📞 **Support & Escalation**

### **Contact Information**
- **Infrastructure Team**: infrastructure@company.com
- **Database Team**: dba@company.com  
- **Security Team**: security@company.com
- **On-Call**: +1-555-ONCALL

### **Escalation Matrix**
1. **Level 1**: Application restart, basic troubleshooting
2. **Level 2**: Infrastructure team, complex issues
3. **Level 3**: Vendor support, critical system failures

---

## ✅ **Deployment Checklist**

### **Pre-Deployment**
- [ ] Backup verification completed
- [ ] Infrastructure health checks passed
- [ ] Security scans completed
- [ ] Load testing completed
- [ ] Rollback plan documented

### **Deployment**
- [ ] Ansible playbook execution successful
- [ ] Health checks passing
- [ ] Monitoring alerts configured
- [ ] Log aggregation working
- [ ] SSL certificates valid

### **Post-Deployment**
- [ ] Smoke tests completed
- [ ] Performance metrics baseline established
- [ ] Team notifications sent
- [ ] Documentation updated
- [ ] Incident response tested

---

## 🏆 **Enterprise Benefits**

### **Infrastructure as Code Advantages**
- ✅ **Reproducible**: Identical environments every time
- ✅ **Versionable**: Track all infrastructure changes
- ✅ **Testable**: Validate changes before production
- ✅ **Auditable**: Complete deployment history
- ✅ **Recoverable**: Rapid disaster recovery

### **Cost Optimization**
- 💰 **Resource Efficiency**: Right-sized containers
- 💰 **Auto-scaling**: Scale based on demand
- 💰 **Shared Storage**: Efficient storage utilization
- 💰 **Monitoring**: Proactive issue resolution

### **Security & Compliance**
- 🔒 **Automated Hardening**: Consistent security configuration
- 🔒 **Audit Logging**: Complete activity tracking
- 🔒 **Access Control**: Role-based permissions
- 🔒 **Data Protection**: Encrypted storage and transmission

---

*This guide represents enterprise-grade deployment practices for the TaskTracker application. Customize configurations based on your specific infrastructure requirements and security policies.*

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintained By**: Infrastructure Team 