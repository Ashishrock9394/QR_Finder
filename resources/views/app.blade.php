<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Finder</title>
    
    <!-- Vite asset loading -->
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body>
    <div id="app"></div>
    
    <!-- Fallback for production -->
    @production
        <script type="module">
            // Fallback for production build
            if (typeof window.__vite_plugin_react_preamble_installed__ === 'undefined') {
                // Load built assets
                const script = document.createElement('script');
                script.src = '/build/assets/app.js';
                document.head.appendChild(script);
                
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = '/build/assets/app.css';
                document.head.appendChild(link);
            }
        </script>
    @endproduction
</body>
</html>