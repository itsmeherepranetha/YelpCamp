# YelpCamp

YelpCamp is a web application that allows users to view, create, and review campgrounds. The app includes authentication, authorization, and the ability to upload campground images,locations. Users can sign up, log in, and interact with other users by adding reviews to campgrounds.

## Demo

Website is hosted using Render,
link : https://yelpcamp-mq0b.onrender.com

## Features

- View campgrounds with details (description, location, and images)
- User authentication with Passport.js (sign-up, login, and logout)
- Create, edit, and delete campgrounds
- Add and remove reviews for campgrounds
- Flash messages for notifications (success, error, etc.)
- Data sanitization and validation for improved security
- Content Security Policy with Helmet.js for enhanced protection
- Sessions stored in MongoDB using `connect-mongo`
- Responsive UI with Bootstrap

## Tech Stack

- **Backend:** Node.js, Express.js, MongoDB Atlas, Mongoose
- **Frontend:** HTML, CSS, JavaScript, EJS, Bootstrap
- **Authentication:** Passport.js, express-session, bcrypt
- **File Storage:** Cloudinary (for image uploads)
- **Security:** Helmet.js, express-mongo-sanitize
- **Deployment:** Render

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/itsmeherepranetha/YelpCamp.git
   cd YelpCamp
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables:**

    Create a .env file in the root directory and add these variables
   ```bash
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_KEY=your_cloudinary_key
   CLOUDINARY_SECRET=your_cloudinary_secret
   MONGODB_URL=your_mongodb_atlas_connection_link
   SECRET=your_secret_key
   NAME=your_cookie_name
   ```

3. **Run it:**

    Start the application using...
   ```bash
   node app.js
   ```
   It should be running on `http://localhost:3000`


# Acknowledgements

  Inspiration from Colt Steele's Web Development Bootcamp
