# Resume2Video

Resume2Video is a web application that allows users to upload resumes and convert them into video presentations. The application leverages various technologies including Next.js, Cloudinary, Firebase, and Tailwind CSS.

## Features

- **Resume Upload**: Users can upload their resumes in various formats.
- **Video Generation**: Convert uploaded resumes into video presentations.
- **User Authentication**: Secure login and registration using Firebase.
- **Responsive Design**: Built with Tailwind CSS for a responsive and modern UI.

## Technologies Used

- **Next.js**: Framework for server-rendered React applications.
- **Cloudinary**: Cloud service for image and video management.
- **Firebase**: Backend-as-a-Service for authentication and database.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **PDF Parsing**: Using `pdf-parse` and `pdfjs-dist` for handling PDF files.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/resume2video.git
   ```
2. Navigate to the project directory:
   ```bash
   cd resume2video
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables in `.env.local`:
   ```plaintext
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

## Usage

- **Development Server**: Start the development server with:
  ```bash
  npm run dev
  ```
- **Build for Production**: Create an optimized production build with:
  ```bash
  npm run build
  ```
- **Start the Production Server**: Run the production server with:
  ```bash
  npm start
  ```

## Project Structure

- **src/app**: Contains the main application logic and API routes.
- **src/components**: Reusable UI components.
- **src/lib**: Utility functions and database connection logic.
- **public**: Static assets like images and icons.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.
