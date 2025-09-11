import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import Chatbot from '../Chatbot/Chatbot';

const Layout = ({ children }) => {
    return (
        <>
            <Navbar />
            <main>{children}</main>
            <Chatbot />
            <Footer />
        </>
    );
};

export default Layout;