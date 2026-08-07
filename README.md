   # 🚀 2ndWeeksofCloudOps - 3 tier Application

✨This repository is created to learn and deploy  3-tier application on aws cloud. this project contain three layer Presentation, Application and database

## 🏠 Architecture
![Architecture of the application](architecture.gif)

## Tech stack

- React 
- Nodejs
- MySQL


**Note**: You should have nodejs installed on your system. [Node.js](https://nodejs.org/)

👉 let install dependency to run react application


```
1.Create rds database into private subnets
2.Create two private  servers in private subnets one is for frontend and another one is for backend
3.Create two TG and loadbalncers one is for frontend another one is for backend 
4.Create both loadblancers in public subnets only and loadbalancer type s internet facing only becuser internal loadbalncer not working for our project 
```
## ------------------------------------Backend------------
### ->>connect to backend server--
```
 git clone https://github.com/CloudTechDevOps/2nd10WeeksofCloudOps-main.git
   cd backend
```
 ### edit the .env file in bellow path if u dont have any .env file just create in below path
```
2nd10WeeksofCloudOps-main.git/backend/.env

### add this mater
DB_HOST=book.rds.com	#change rds endpoint
DB_USERNAME=admin	#cahnge to nyour rds user name 
DB_PASSWORD="veera"   # change to your rds password
PORT=3306
```
```
yum install mariadb105-server
sudo dnf install -y nodejs
sudo npm install -g pm2
```
#### SSH into backend server and then run test.sql script from backend to create tables and records 
```
mysql -h book.rds.com -u admin -p<password> < test.sql
```

### Backend deploy process ###
```
cd backend

npm install

npm install dotenv

sudo pm2 start index.js --name node-app

sudo pm2 startup

sudo systemctl enable pm2-root

sudo pm2 save
```
#### after that create backend tg and loadbalncer and check your loadbalncer is giving response or not 


# ---------------------------------- FrontEnd---------------------------------------

# revrse proxy

### if you want to use internnal loadbalncer please go through below procress
# Reverse Proxy & Backend Setup (Amazon Linux)

This repository contains an Nginx reverse-proxy configuration that serves a React frontend and proxies API requests to a backend at private IP or loadbalancer.

## Files
- nginx.conf — Nginx server block (this file)

```bash
sudo yum update -y
sudo yum install -y nginx
# Enable and start nginx
sudo systemctl enable --now nginx
```
### create a proxy file and paste the file from git and chage the backend private ip  if you are using internal loadbalncer change it 
```bash
sudo vi /etc/nginx/conf.d/nginx.conf
```
### paste below file and change loadbalancer url inplace of local host
```
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

   location /socket.io {
        proxy_pass http://localhost;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```
# Verify
2. Test and reload nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Deploy React build to Nginx
On the machine where you build the React app (or directly on the nginx server):

```bash
sudo dnf install -y nodejs
npm install

npm run build

# Copy the build files to nginx root on the nginx host
sudo rm -rf /usr/share/nginx/html/*
sudo cp -r build/* /usr/share/nginx/html/

# reload nginx
sudo systemctl reload nginx
sudo systemctl enable nginx
```

If your React app expects the app to be served at `/` this config will work as-is because the `location /` block uses `try_files` to return `index.html` for client routes.

## Sample Backend Setup (Amazon Linux) — Node.js / Express
These instructions create a minimal API that listens on port 80 and matches the `proxy_pass` target.


**Thank you so much for reading..😅**
