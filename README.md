# Cheat Sheet Generator

A desktop application that generates printable cheat sheets for POS (Point of Sale) systems from Excel item lists. The application allows users to select specific sheets from an Excel file, generate cheat sheets with QR codes for each product, and either print them or save them as PNG images.

## Features

- Import product data from Excel files
- Select specific sheets from Excel files
- Generate cheat sheets with QR codes for each product
- Print cheat sheets directly from the application
- Save cheat sheets as PNG images
- Cross-platform support (Windows, macOS, Linux)

## Technologies Used

### Frontend
- React 19
- TypeScript
- Vite
- TailwindCSS
- HeroUI React components
- Framer Motion for animations

### Backend
- Rust
- Tauri (v2) - Framework for building desktop applications with web technologies
- Calamine - Excel file processing library for Rust
- QRC - QR code generation library for Rust

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) (v8 or later)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable version)
- [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Mardens-Inc/cheat-sheet-generator.git
   cd cheat-sheet-generator
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

## Development

To run the application in development mode:

```bash
pnpm tauri-dev
```

This will start the development server and open the application in a new window.

## Building

To build the application for production:

```bash
pnpm tauri-build
```

This will create executable files for your platform in the `target/release` directory.

## Usage

1. Launch the application
2. Select an Excel file containing product data
3. Choose which sheets from the Excel file to include
4. The application will generate cheat sheets with QR codes for each product
5. Use the buttons at the bottom to:
   - Print the cheat sheets
   - Save the cheat sheets as PNG images

## Project Structure

- `src/` - Frontend code (React, TypeScript)
- `src-tauri/` - Backend code (Rust)
- `src-tauri/src/commands/` - Tauri commands for interacting with the system
- `src/assets/` - Frontend assets and components

## License

This project is licensed under the [GPL-3.0 or later](LICENSE) license.

## Author

Drew Chase
