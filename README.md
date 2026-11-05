# Marketplace Website

## Overview
The goal of this project is to refractor and expand a static website into a secure, dynamic e-commerce application. Key imporvements include: 
- Dynamic Templating: converted static html files into .ejs dynamic templates to support server-side rendering (SSR).
- Authentication and Authorization: Implemented multi-role user authentication (Admin, Employee, and Customer/Buyer) with role-based permissions. 
- Data Validation: Integrated frontend and backend validation to verify user inputs and protect server integrity
- Shopping Feature: Build a product catalog, shopping cart, and a responsive contact form
- Layout: Structured using MVC patterns and ES Modules syntax (import/export).

## Technologies 
**Backend and Server**
- Node.js - JavaScript runtime environment
- Express.js - Web application framework for routing and middleware management
- ES Modules(ESM) - Modern JavaScript module standard. 

**Frontend and Templating**
- EJS (Embedded JavaScript) - Server side rendering (SSR) template engine
- HTML / CSS /JavaScript - Client-side scripting, styling, and DOM validation

**Database**
- PostgreSQL - Relational database system.

**Hosting and Deployment**
- Render 


## Layout
├── README.md
├── head.ejs
├── home.html
├── package.json
├── public
│   ├── css
│   │   └── main.css
│   └── images
├── root.crt
├── server.js
└── src
    ├── controllers
    │   ├── index.js
    │   └── routes.js
    ├── middleware
    │   └── global.js
    ├── models
    │   └── catalog
    └── views
        └── partials
            ├── footer.ejs
            ├── header.ejs
            └── nav.ejs
            

## Database Relationships
- Users - Stores account data and role types (Admin, Employee, Customer).
- Products: Inventory details, pricing, and availability. 
- Orders/ Cart:
    - 1 : Many relationship between Users and Orders 
    - Many : Many relationship between Orders and Products (Resolved through an Order_item junction table containing product id, quantity, and price at time of purchase).
- Messages / Contact - Stores user queries submitted through the contact form. 

## Render
[View on Render] (https://cse340-final-8xt5.onrender.com)