import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <Navbar />
      <Outlet /> {/* page renders here */}
      <Footer />
    </>
  );
}