import {Table} from "./Table"
enum OrderStatus { OPEN,CLOSE}
export class Order 
{  
    items: {name: string; price: number}[] = [];
    orderStatus:OrderStatus;

    constructor(public table: Table)
    {
        this.table.OccupyTable();
        this.orderStatus = OrderStatus.OPEN;
    }

    addItem(name: string, price: number):void
    {
        this.items.push({name, price});
    }

    calculateTotal ():number
    {
        /*let total: number = 0;
        this.items.forEach(item => {
            total += item.price;
        });*/
        return this.items.reduce((total, item) => total + item.price, 0)
    }

    closeOrder():number
    {
        this.orderStatus = OrderStatus.CLOSE;
        this.table.FreeTable();
        return this.calculateTotal();
    }

}