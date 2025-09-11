import styles from './Services.module.css';

const services = [
    {
        name: "MOT Test",
        price: "£54.85",
        description: "A comprehensive, DVSA-approved MOT test for all Class 4 vehicles. We ensure your vehicle is safe, roadworthy, and meets all environmental standards."
    },
    {
        name: "Standard Service",
        price: "£125.00",
        description: "Our standard service is ideal for an annual check-up. It includes an oil and filter change, fluid top-ups, and a thorough inspection of key components like brakes, tyres, and suspension."
    },
    {
        name: "Major Service",
        price: "£210.00",
        description: "Our most comprehensive service package. It includes everything in the standard service, plus replacement of spark plugs, fuel filters, and a full diagnostic scan."
    },
    {
        name: "Brake Fluid Change",
        price: "£45.00",
        description: "Essential for safety, we replace your old brake fluid to prevent brake failure and ensure optimal performance. Recommended every two years."
    },
    {
        name: "Air Con Recharge",
        price: "£60.00",
        description: "Keep cool with our air conditioning recharge service. We'll top up the refrigerant gas, ensuring your system runs efficiently, especially in warmer months."
    },
    {
        name: "Diagnostic Check",
        price: "£49.99",
        description: "Warning light on your dash? Our state-of-the-art diagnostic tools allow us to quickly identify faults within your vehicle's engine, brakes, and electrical systems."
    }
];

const Services = () => {
    return (
        <div className={styles.servicesPage}>
            <div className={styles.hero}>
                <h1>Our Services</h1>
                <p>Professional care for your vehicle, at prices you can trust.</p>
            </div>
            <div className={styles.servicesGrid}>
                {services.map(service => (
                    <div key={service.name} className={styles.serviceCard}>
                        <h3>{service.name}</h3>
                        <p className={styles.price}>{service.price}</p>
                        <p className={styles.description}>{service.description}</p>
                        <a href="/contact" className={styles.bookButton}>Book Now</a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Services;