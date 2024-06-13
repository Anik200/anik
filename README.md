<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Basic Webpage</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f0f0f0;
        }

        header {
            background-color: #333;
            color: #fff;
            padding: 20px;
            text-align: center;
        }

        nav {
            background-color: #666;
            color: #fff;
            padding: 10px;
            text-align: center;
        }

        nav a {
            color: #fff;
            text-decoration: none;
            margin: 0 10px;
            transition: transform 0.3s ease;
        }

        nav a:hover {
            transform: scale(1.1); /* Scale the link on hover */
        }

        nav a.home:hover {
            transform: scale(1.2); /* Scale the home link on hover */
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); /* Add shadow effect */
        }

        main {
            padding: 20px;
        }

        footer {
            background-color: #333;
            color: #fff;
            text-align: center;
            padding: 10px;
            position: fixed;
            bottom: 0;
            width: 100%;
        }
    </style>
</head>
<body>
    <header>
        <h1>Welcome to My Website</h1>
    </header>
    
    <nav>
        <a href="#" class="home">Home</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
    </nav>

    <main>
        <h2>About Us</h2>
        <p>This is a basic webpage created using HTML and CSS.</p>
    </main>

    <footer>
        <p>&copy; 2024 My Website. All rights reserved.</p>
    </footer>
</body>
</html>
