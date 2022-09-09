import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const { url, price } = createTicketDto;
    const result: string[] | Error = await this.scrape(url);
    if (!result) {
      throw result;
    }

    // const ticket_num = result[1];
    const ticket_title = result[2];
    // const ticket_name = result[4];
    const ticket_type = result[6];
    const ticket_category = result[8];
    const opening_time = result[10];
    const last_entry = result[12];

    const ticket = this.ticketsRepository.create({
      title: ticket_title,
      type: ticket_type,
      category: ticket_category,
      openTime: opening_time,
      lastEntry: last_entry,
      url,
      price,
    });

    return this.ticketsRepository.save(ticket);
  }

  async scrape(ticketUrl: string): Promise<string[] | Error> {
    try {
      const axios_result = await axios.get(ticketUrl);
      const pattern = '<section class="sc-1md1qs5-5 eLYqFu">.*?</section>';
      const htmlString = axios_result.data;
      const parsingString = htmlString.match(pattern)[0];
      const html_tag = /<.*?>/g;
      const tbd_symbol = /—/g;
      const denominator = '/';
      const result: string[] = parsingString
        .replace(html_tag, denominator)
        .replace(tbd_symbol, 'TBD')
        .split(denominator)
        .filter((element: string) => {
          return element !== '';
        });

      return result;
    } catch (err) {
      return err;
    }
  }
}
