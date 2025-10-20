# CS4218 Project - Virtual Vault

## 1. Project Introduction

Virtual Vault is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) e-commerce website, offering seamless connectivity and user-friendly features. The platform provides a robust framework for online shopping. The website is designed to adapt to evolving business needs and can be efficiently extended.

## 2. Website Features

- **User Authentication**: Secure user authentication system implemented to manage user accounts and sessions.
- **Payment Gateway Integration**: Seamless integration with popular payment gateways for secure and reliable online transactions.
- **Search and Filters**: Advanced search functionality and filters to help users easily find products based on their preferences.
- **Product Set**: Organized product sets for efficient navigation and browsing through various categories and collections.

## 3. Your Task

- **Unit and Integration Testing**: Utilize Jest for writing and running tests to ensure individual components and functions work as expected, finding and fixing bugs in the process.
- **UI Testing**: Utilize Playwright for UI testing to validate the behavior and appearance of the website's user interface.
- **Code Analysis and Coverage**: Utilize SonarQube for static code analysis and coverage reports to maintain code quality and identify potential issues.
- **Load Testing**: Leverage JMeter for load testing to assess the performance and scalability of the ecommerce platform under various traffic conditions.

## 4. Setting Up The Project

### 1. Installing Node.js

1. **Download and Install Node.js**:

   - Visit [nodejs.org](https://nodejs.org) to download and install Node.js.

2. **Verify Installation**:
   - Open your terminal and check the installed versions of Node.js and npm:
     ```bash
     node -v
     npm -v
     ```

### 2. MongoDB Setup

1. **Download and Install MongoDB Compass**:

   - Visit [MongoDB Compass](https://www.mongodb.com/products/tools/compass) and download and install MongoDB Compass for your operating system.

2. **Create a New Cluster**:

   - Sign up or log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
   - After logging in, create a project and within that project deploy a free cluster.

3. **Configure Database Access**:

   - Create a new user for your database (if not alredy done so) in MongoDB Atlas.
   - Navigate to "Database Access" under "Security" and create a new user with the appropriate permissions.

4. **Whitelist IP Address**:

   - Go to "Network Access" under "Security" and whitelist your IP address to allow access from your machine.
   - For example, you could whitelist 0.0.0.0 to allow access from anywhere for ease of use.

5. **Connect to the Database**:

   - In your cluster's page on MongoDB Atlas, click on "Connect" and choose "Compass".
   - Copy the connection string.

6. **Establish Connection with MongoDB Compass**:
   - Open MongoDB Compass on your local machine, paste the connection string (replace the necessary placeholders), and establish a connection to your cluster.

### 3. Application Setup

To download and use the MERN (MongoDB, Express.js, React.js, Node.js) app from GitHub, follow these general steps:

1. **Clone the Repository**

   - Go to the GitHub repository of the MERN app.
   - Click on the "Code" button and copy the URL of the repository.
   - Open your terminal or command prompt.
   - Use the `git clone` command followed by the repository URL to clone the repository to your local machine:
     ```bash
     git clone <repository_url>
     ```
   - Navigate into the cloned directory.

2. **Install Frontend and Backend Dependencies**

   - Run the following command in your project's root directory:

     ```
     npm install && cd client && npm install && cd ..
     ```

3. **Add database connection string to `.env`**

   - Add the connection string copied from MongoDB Atlas to the `.env` file inside the project directory (replace the necessary placeholders):
     ```env
     MONGO_URL = <connection string>
     ```

4. **Adding sample data to database**

   - Download “Sample DB Schema” from Canvas and extract it.
   - In MongoDB Compass, create a database named `test` under your cluster.
   - Add four collections to this database: `categories`, `orders`, `products`, and `users`.
   - Under each collection, click "ADD DATA" and import the respective JSON from the extracted "Sample DB Schema".

5. **Running the Application**
   - Open your web browser.
   - Use `npm run dev` to run the app from root directory, which starts the development server.
   - Navigate to `http://localhost:3000` to access the application.

## 5. Unit Testing with Jest

Unit testing is a crucial aspect of software development aimed at verifying the functionality of individual units or components of a software application. It involves isolating these units and subjecting them to various test scenarios to ensure their correctness.  
Jest is a popular JavaScript testing framework widely used for unit testing. It offers a simple and efficient way to write and execute tests in JavaScript projects.

### Getting Started with Jest

To begin unit testing with Jest in your project, follow these steps:

1. **Install Jest**:  
   Use your preferred package manager to install Jest. For instance, with npm:

   ```bash
   npm install --save-dev jest

   ```

2. **Write Tests**  
   Create test files for your components or units where you define test cases to evaluate their behaviour.

3. **Run Tests**  
   Execute your tests using Jest to ensure that your components meet the expected behaviour.  
   You can run the tests by using the following command in the root of the directory:

   - **Frontend tests**

     ```bash
     npm run test:frontend
     ```

   - **Backend tests**

     ```bash
     npm run test:backend
     ```

   - **All the tests**
     ```bash
     npm run test
     ```


## CI Run URL (Milestone 1)
Github Workflow Submission: [URL](https://github.com/cs4218/cs4218-2510-ecom-project-team010/actions/runs/18259819050/job/51986214739)

## Members Contributions

### Lee Yi Lin (test cases were made with the aid of AI)
1. Admin Actions

- `components/Form/CategoryForm.js`
- `pages/admin/CreateCategory.js`
- `pages/admin/CreateProduct.js`
- `pages/admin/UpdateProduct.js`
- `controllers/categoryController.js`

2. Search

- `components/Form/SearchInput.js`
- `context/search.js`
- `pages/Search.js`

3. Category

- `hooks/useCategory.js`
- `pages/Categories.js`
- `controllers/categoryController.js`
- `models/categoryModel.js`

### Janna Leong (test cases were made with the aid of AI)

### Unit Tests
1. Admin View Orders

- `pages/admin/AdminOrders.js`

2. Admin View Products

- `pages/admin/Products.js `
- `controllers/productController.js`
   - `createProductController`
   - `deleteProductController`
   - `updateProductController` 

3. Policy 

- `pages/Policy.js`

4. Cart

- `context/cart.js`
- `pages/CartPage.js`

5. Payment

- `controllers/productController.js`
   - `braintreeTokenController`
   - `brainTreePaymentController`

### Integration tests

1. Admin View Orders

- `pages/admin/AdminOrders.js`
   - related test files : `pages/admin/AdminOrders-AdminMenu.integration.test.js`, `pages/admin/AdminOrders-useAuth.integration.test.js`

2. Admin View Products

- `pages/admin/Products.js `
   - related test files : `pages/admin/products-adminmenu.integration.test.js`
- `controllers/productController.js`
   - `createProductController`
   - `deleteProductController`
   - `updateProductController` 
   - related test files : `controllers/productController-productModel-fs.integration.test.js`

3. Policy 

- `pages/Policy.js`
   - related test files : `pages/policy-layout.integration.test.js`

4. Payment

- `controllers/productController.js`
   - `braintreeTokenController` 
      - related test files : `controllers/productController-braintree.integration.test.js`
   - `brainTreePaymentController`
      - related test files : `controllers/productController-braintree-orderModel.integration.test.js`


### UI test cases 

#### Test instructions

As these are end to end test cases that are dependent on a real database, please kindly follow the below testing instructions to test the following pages in my scope. 

1. Ensure the database is reset to the original state given to students at the beginning of the project. These json files to load the original data can be found on canvas in the project section.
2. Load the website on local host using `npm run dev` and create a user called with
   - name: janna
   - email: jannaleong7@gmail.com
   - phone: 99999999
   - address: 123
   - password: 123
3. On mongoDB Atlas, make this user an admin by editing this role to be 1.
4. Edit the playwright.config.ts file such that testDir: './ui-tests-janna' to test solely my UI testcases.
5. Run `npx playwright test` on a seperate terminal.


#### Testing scope for UI tests

1. Admin View Orders

- `pages/admin/AdminOrders.js`

2. Admin View Products

- `pages/admin/Products.js `

3. Policy 

- `pages/Policy.js`

4. About page

- `pages/About.js`

5. Cart

- `pages/CartPage.js` (only tested for test scenarios for a guest user. Remaining test scenarios for a logged in user completed by yuanjing)


### Althea Chua (test cases were made with the aid of AI)

#### Unit tests

1. Admin Dashboard

- `components/AdminMenu.js`
- `pages/admin/AdminDashboard.js`

2. General

- `components/Routes/Private.js`
- `components/UserMenu.js`
- `pages/user/Dashboard.js`
- `models/userModel.js` 

3. Admin View Users 

- `pages/admin/Users.js`

4. Contact

- `pages/Contact.js`

5. Home

- `pages/Homepage.js`

#### Integration tests

1. Integration between App - AdminRoute - AdminDashboard - AdminMenu

- `components/Routes/App-AdminRoute.integration.test.js`
- `pages/admin/AdminRoute-AdminDashboard.integration.test.js`
- `components/AdminDashboard-AdminMenu.integration.test.js`

2. Integration between authRoute - authController - orderModel 

- `routes/authRoute-authMiddleware-authController.integration.test.js`
- `controllers/authController-orderModel.integration.test.js`

3. Integration between userModel - mongoose

- `models/userModel-mongoose.integration.test.js`

### Yuan Jing (test cases were made with the aid of AI)

1. Protected Routes
- Client
   - context/auth.js
- Server
   - helpers/authHelper.js
   - middlewares/authMiddleware.js

2. Registration and Login
- Client
   - pages/Auth/Register.js
   - pages/Auth/Login.js
- Server
   - controllers/authController.js

3. Order
- Client
   - pages/user/Orders.js
- Server
   - controllers/authController.js


### Miguel Foo (test cases were made with the aid of AI)

1. Frontend Components
   - `pages/About.js`
   - `pages/Pagenotfound.js`
   - `pages/user/Profile.js`
   - `components/Footer.js`
   - `components/Header.js`
   - `components/Layout.js`
   - `components/Spinner.js`

2. Backend Configuration and APIs
   - `config/db.js`
   - `controllers/productController.js`
     - `getProductController`
     - `getSingleProductController`
     - `productPhotoController`
     - `productFiltersController`
     - `productCountController`
     - `productListController`
     - `searchProductController`
     - `realtedProductController`
     - `productCategoryController`
