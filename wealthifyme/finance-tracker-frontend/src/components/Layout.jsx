import Sidebar from "./Sidebar";

const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-slate-100 dark:bg-dark-bg">
    <Sidebar />
    <main className="flex-1 ml-60 min-h-screen overflow-y-auto">
      <div className="p-6 page-enter">{children}</div>
    </main>
  </div>
);

export default Layout;