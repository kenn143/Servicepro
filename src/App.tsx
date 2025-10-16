import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FileTracker from "./pages/FileTracker";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { FC, ReactNode } from "react";
import QuotationList from "./pages/QuotationList";
import Quote from "./pages/Quote";
import Preview from "./pages/Preview";
import EditPage from "./pages/EditPage";
import ApprovedPage from "./pages/ApprovedPage";
import CreateInvoice from "./pages/Invoice/CreateInvoice";
import InvoiceList from "./pages/Invoice/InvoiceList";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Captures from "./pages/Captures";
import CustomerPreview from "./pages/Customer/Preview";
import CustomerList from "./pages/Customer/CustomerList";

function AnimatedRoutes() {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("userId");

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<AppLayout />}>
          <Route
            path="/home"
            element={
              <ProtectedRoute requiredRight="Dashboard">  
                <PageWrapper><Home /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/file-tracker"
            element={
              <ProtectedRoute requiredRight="Flyer Tracker">
                <PageWrapper><FileTracker /></PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/captures"
            element={
              <ProtectedRoute requiredRight="FlyerTracker Captures">
                <PageWrapper><Captures /></PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/quotation-list"
            element={
              <ProtectedRoute requiredRight="Light Installers Quote">
                <PageWrapper><QuotationList /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quote-entry"
            element={
              <ProtectedRoute requiredRight="Light Installers Quote">
                <PageWrapper><Quote /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotation"
            element={
              <ProtectedRoute requiredRight="Light Installers Quote">
                <PageWrapper><Preview /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute requiredRight="Light Installers Quote">
                <PageWrapper><EditPage /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/approved"
            element={
              <ProtectedRoute requiredRight="Light Installers Quote">
                <PageWrapper><ApprovedPage /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-invoice"
            element={
              <ProtectedRoute requiredRight="Invoice">
                <PageWrapper><CreateInvoice /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoice-list"
            element={
              <ProtectedRoute requiredRight="Invoice">
                <PageWrapper><InvoiceList /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute requiredRight="Job Calendar">
                <PageWrapper><Calendar /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/basic-tables"
            element={
              <ProtectedRoute requiredRight="Dashboard">
                <PageWrapper><BasicTables /></PageWrapper>
              </ProtectedRoute>
            }
          />
            <Route path="/customer-list" element={<PageWrapper><CustomerList /></PageWrapper>} />
        </Route>

        {/* Auth pages */}
        <Route path="/signin" element={<PageWrapper><SignIn /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><SignUp /></PageWrapper>} />
      

        {/* <Route path="/calendar" element={<PageWrapper><Calendar /></PageWrapper>} /> */}

        {/* Root route → redirect depending on auth */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to="/home" replace />
              : <PageWrapper><SignIn /></PageWrapper>
          }
        />

        {/* Not Found */}
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />

        <Route path="/customerPreview" element={<PageWrapper><CustomerPreview/></PageWrapper>} />
      </Routes>

      <ToastContainer className="!z-[100000]" />
    </AnimatePresence>
  );
}

const PageWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AnimatedRoutes />
    </Router>
  );
}
