  import { useEffect, useState } from "react";
  import { listenCustomers } from "../firebase/dashboard.service";

  export const useCustomers = (role) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      //console.log("🔥 useCustomers hook mounted");
      if (!role) return;

      const unsub = listenCustomers((data) => {
        //console.log("📦 Customers from Firestore:", data);
        setCustomers(data);
        setLoading(false);
      }, role);

      return () => {
          //console.log("❌ useCustomers unmounted");
          unsub && unsub()
      };
    }, [role]);

    return {
      customers,
      customerCount: customers.length,
      loading,
    };
  };
