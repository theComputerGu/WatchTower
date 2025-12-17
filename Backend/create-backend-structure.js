const fs = require("fs");
const path = require("path");

// Root is current directory (Backend)
const root = process.cwd();

// Folders to create
const folders = [
  "Controllers",
  "Models",
  "Models/Enums",
  "DTOs",
  "DTOs/Auth",
  "Data",
  "Services",
  "Services/Interfaces",
  "Config",
];

// Files to create
const files = [
  "Controllers/AuthController.cs",

  "Models/User.cs",
  "Models/Enums/UserRole.cs",

  "DTOs/Auth/SignUpRequest.cs",
  "DTOs/Auth/AuthResponse.cs",

  "Data/AppDbContext.cs",

  "Services/Interfaces/IJwtService.cs",
  "Services/JwtService.cs",

  "Config/JwtSettings.cs",
];

// Create folders
folders.forEach((folder) => {
  const folderPath = path.join(root, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`📁 Created folder: ${folder}`);
  }
});

// Create files
files.forEach((file) => {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
    console.log(`📄 Created file: ${file}`);
  }
});

console.log("✅ Backend folder structure created successfully");
