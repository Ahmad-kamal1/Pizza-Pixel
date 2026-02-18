export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
}

export const menuItems: MenuItem[] = [
  { id: 1, name: "Margherita", description: "Classic tomato, mozzarella & basil", price: "$12.99", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop" },
  { id: 2, name: "Pepperoni", description: "Loaded pepperoni with extra cheese", price: "$14.99", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop" },
  { id: 3, name: "BBQ Chicken", description: "Smoky BBQ sauce with grilled chicken", price: "$15.99", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop" },
  { id: 4, name: "Veggie Supreme", description: "Fresh garden vegetables & herbs", price: "$13.99", image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=300&fit=crop" },
  { id: 5, name: "Hawaiian", description: "Ham & pineapple classic combo", price: "$13.99", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop" },
  { id: 6, name: "Meat Lovers", description: "Sausage, bacon, ham & pepperoni", price: "$16.99", image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&h=300&fit=crop" },
  { id: 7, name: "Garlic Bread", description: "Crispy bread with garlic butter", price: "$6.99", image: "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400&h=300&fit=crop" },
  { id: 8, name: "Caesar Salad", description: "Romaine, croutons & parmesan", price: "$9.99", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop" },
  { id: 9, name: "Pasta Carbonara", description: "Creamy bacon & egg pasta", price: "$14.99", image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop" },
  { id: 10, name: "Mushroom Risotto", description: "Wild mushrooms & truffle oil", price: "$15.99", image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop" },
  { id: 11, name: "Bruschetta", description: "Tomato, basil & balsamic glaze", price: "$8.99", image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop" },
  { id: 12, name: "Tiramisu", description: "Classic Italian coffee dessert", price: "$7.99", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop" },
  { id: 13, name: "Calzone", description: "Folded pizza with ricotta & ham", price: "$14.99", image: "https://images.unsplash.com/photo-1536964549093-de1caab73954?w=400&h=300&fit=crop" },
  { id: 14, name: "Chicken Wings", description: "Spicy buffalo wings with ranch", price: "$11.99", image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop" },
  { id: 15, name: "Lemonade", description: "Freshly squeezed with mint", price: "$4.99", image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop" },
  { id: 16, name: "Four Cheese", description: "Mozzarella, gorgonzola, parmesan & fontina", price: "$15.99", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop" },
];
