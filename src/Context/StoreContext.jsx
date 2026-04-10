import { createContext, useEffect, useState } from "react";
import { menu_list, food_list as defaultFoodList } from "../assets/assets";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

    // ✅ Backend URL (Vercel or Local fallback)
    const url = import.meta.env.VITE_API_URL || "http://localhost:8000";

    const [food_list, setFoodList] = useState(defaultFoodList);
    const [cartItems, setCartItems] = useState({});
    const [token, setToken] = useState("");

    // 🛒 ADD TO CART
    const addToCart = async (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: prev[itemId] ? prev[itemId] + 1 : 1
        }));

        try {
            if (token) {
                await axios.post(
                    `${url}/api/cart/add`,
                    { itemId },
                    { headers: { token } }
                );
            }
        } catch (error) {
            console.log("Error adding to cart:", error.message);
        }
    };

    // 🛒 REMOVE FROM CART
    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: prev[itemId] - 1
        }));

        try {
            if (token) {
                await axios.post(
                    `${url}/api/cart/remove`,
                    { itemId },
                    { headers: { token } }
                );
            }
        } catch (error) {
            console.log("Error removing from cart:", error.message);
        }
    };

    // 💰 TOTAL CART AMOUNT
    const getTotalCartAmount = () => {
        let totalAmount = 0;

        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = food_list.find(
                    (product) => product._id === item
                );

                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
        }

        return totalAmount;
    };

    // 🍔 FETCH FOOD LIST
    const fetchFoodList = async () => {
        try {
            const response = await axios.get(`${url}/api/food/list`);
            const serverFood = response?.data?.data;
            if (Array.isArray(serverFood) && serverFood.length > 0) {
                setFoodList(serverFood);
            } else {
                setFoodList(defaultFoodList);
            }
        } catch (error) {
            console.log("Error fetching food list:", error.message);
            setFoodList(defaultFoodList);
        }
    };

    // 🧾 LOAD CART DATA
    const loadCartData = async (token) => {
        try {
            const response = await axios.post(
                `${url}/api/cart/get`,
                {},
                { headers: { token } }
            );
            setCartItems(response?.data?.cartData || {});
        } catch (error) {
            console.log("Error loading cart:", error.message);
        }
    };

    // 🚀 INITIAL LOAD
    useEffect(() => {
        const loadData = async () => {
            await fetchFoodList();

            const storedToken = localStorage.getItem("token");

            if (storedToken) {
                setToken(storedToken);
                await loadCartData(storedToken);
            }
        };

        loadData();
    }, []);

    // 🌐 GLOBAL CONTEXT VALUE
    const contextValue = {
        url,
        food_list,
        menu_list,
        cartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        token,
        setToken,
        loadCartData,
        setCartItems
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;