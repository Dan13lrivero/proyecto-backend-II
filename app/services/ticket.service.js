import { Ticket } from "../models/ticket.model.js";

export class TicketService {
    async createTicket({ purchaser, products, amount }) {

        const code = `T-${Date.now()}`;

        const ticket = await Ticket.create({
            code,
            purchaser,
            products,
            amount
        });

        return ticket;
    }
}

export const ticketService = new TicketService();
