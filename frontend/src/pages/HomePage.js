import React from "react";

const HomePage = () => {
  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <a href="/" style={styles.navItem}>Home</a>
        {/* Add more navigation items as needed */}
      </nav>
      <div style={styles.hero}>
        <h1>Welcome to Our Website!</h1>
      </div>
      <footer style={styles.footer}>
      </footer>
    </div>
  );
};

// Styles
const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "0 20px",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#007BFF",
    color: "#FFFFFF",
    padding: "10px 20px",
  },
  navItem: {
    color: "#FFFFFF",
    textDecoration: "none",
    fontSize: "18px",
  },
  hero: {
    textAlign: "center",
    margin: "50px 0",
  },
  footer: {
    marginTop: "20px",
    textAlign: "center",
    padding: "20px 0",
    borderTop: "1px solid #E7E7E7",
  },
};

export default HomePage;

