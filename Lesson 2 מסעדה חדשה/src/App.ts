import { Customer } from "./models/Customer";
import { Restaurant } from "./services/RestuarantManager";
import { Table } from "./models/Table";
import { Order } from "./models/Order";

const restaurant: Restaurant = new Restaurant();
restaurant.addCustomer(1234, "Sara");

const currentCustomer: Customer | undefined = restaurant.findCustomer(1234);
if (currentCustomer != undefined)
    console.log(currentCustomer.name);
else
    console.log("No customer");

function addTwoTables(restaurant: Restaurant) {
    const seatsPerTable = 6; 
    for (let i = 0; i < 3; i++) { 
        const table = new Table(restaurant.Tables.length + 1, seatsPerTable);
        restaurant.Tables.push(table);
    }

}

addTwoTables(restaurant);


restaurant.addCustomer(1, "miriam");
restaurant.addCustomer(2, "dina");
restaurant.addCustomer(3, "Eti");


restaurant.addOrder(1,2)
restaurant.addOrder(4,3)
restaurant.addOrder(5,11)





const tableNumber = 1;
const order = restaurant.FindorderbynumTable(tableNumber);
if (order) {
    order.addItem("פיצה", 60);
    order.addItem("סלט", 85);
  
    const tableNumber=2;
    const  order2=restaurant.findOrderByCustomerDetails(tableNumber);
    if(order2){
        order2.addItem("ציפס",30);
        order2.addItem("שייק",35);

    }

    const total = order.closeOrder();
    console.log("הסכום לתשלום:", total);

    const manualTotal = order.items.reduce((sum, item) => sum + item.price, 0);
    console.log("סכום מחושב ידנית:", manualTotal);

    if (total === manualTotal) {
        console.log("הסכום תואם את מחירי המנות.");
    } else {
        console.log("יש אי התאמה בסכום.");
    }

    const newOrder = restaurant.addOrder(5, 10);
    if (newOrder) {
        console.log("ההזמנה נפתחה בהצלחה!");
    } else {
        console.log("אין שולחן פנוי לכמות האנשים הזו.");
    }
}