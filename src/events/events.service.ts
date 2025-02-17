import { Injectable, NotFoundException } from '@nestjs/common';
import { random } from 'lodash';
import { PREFIX } from '../utils/constant.util';
import { PrismaService } from '../utils/services/prisma.service';
import { StorageService } from '../utils/services/storage.service';
import { getStatus, slug } from '../utils/string.util';
import { CreateEventDto, EventsQuery, UpdateEventDto } from './events.dto';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async getPublicEvents(query: EventsQuery) {
    const default_page = 1;
    const take = 8;

    const page = query.page ? parseInt(query.page) : default_page;

    const skip = (page - 1) * take;

    const [total_events, events] = await this.prisma.$transaction([
      this.prisma.event.count({
        where: {
          is_active: true,
          OR: [
            {
              title: {
                contains: query.filter,
              },
            },
            {
              pillar: {
                slug: {
                  contains: query.filter,
                },
              },
            },
            {
              subpillar: {
                slug: {
                  contains: query.filter,
                },
              },
            },
            {
              pillar_id:
                !query.filter || query.filter == 'Lainnya'
                  ? null
                  : { not: null },
            },
            {
              sub_pillar_id:
                !query.filter || query.filter == 'Lainnya'
                  ? null
                  : { not: null },
            },
          ],
        },
      }),
      this.prisma.event.findMany({
        where: {
          is_active: true,
          OR: [
            {
              title: {
                contains: query.filter,
              },
            },
            {
              pillar: {
                slug: {
                  contains: query.filter,
                },
              },
            },
            {
              subpillar: {
                slug: {
                  contains: query.filter,
                },
              },
            },
            {
              pillar_id:
                !query.filter || query.filter == 'Lainnya'
                  ? null
                  : { not: null },
            },
            {
              sub_pillar_id:
                !query.filter || query.filter == 'Lainnya'
                  ? null
                  : { not: null },
            },
          ],
        },
        select: {
          event_id: true,
          slug: true,
          image_url: true,
          title: true,
          start: true,
          end: true,
          pillar: {
            select: {
              name: true,
            },
          },
          subpillar: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take,
        skip,
      }),
    ]);

    return {
      events: events.map((event) => {
        return {
          ...event,
          status: getStatus(event.start, event.end),
          pillar: event.pillar ? event.pillar.name : 'Lainnya',
          subpillar: event.subpillar ? event.subpillar.name : 'Lainnya',
        };
      }),
      page: events.length ? page : 0,
      total_events,
      total_pages: Math.ceil(total_events / take),
    };
  }

  async getEvents(query: EventsQuery) {
    const default_page = 1;
    const take = 8;

    const page = query.page ? parseInt(query.page) : default_page;

    const skip = (page - 1) * take;

    const [total_events, events] = await this.prisma.$transaction([
      this.prisma.event.count({
        where: {
          title: {
            contains: query.q,
          },
        },
      }),
      this.prisma.event.findMany({
        where: {
          title: {
            contains: query.q,
          },
        },
        select: {
          event_id: true,
          slug: true,
          image_url: true,
          title: true,
          start: true,
          end: true,
          created_at: true,
          created_by: true,
          pillar: {
            select: {
              name: true,
            },
          },
          subpillar: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take,
        skip,
      }),
    ]);

    return {
      events: events.map((event) => {
        return {
          ...event,
          status: getStatus(event.start, event.end),
          pillar: event.pillar ? event.pillar.name : 'Lainnya',
          subpillar: event.subpillar ? event.subpillar.name : 'Lainnya',
        };
      }),
      page: events.length ? page : 0,
      total_events,
      total_pages: Math.ceil(total_events / take),
    };
  }

  async getPublicEvent(id_or_slug: string) {
    const event = await this.prisma.event.findFirst({
      where: {
        is_active: true,
        OR: [
          {
            event_id: id_or_slug,
          },
          {
            slug: id_or_slug,
          },
        ],
      },
      select: {
        event_id: true,
        slug: true,
        type: true,
        image_url: true,
        title: true,
        start: true,
        end: true,
        location: true,
        detail: true,
        map_url: true,
        payment_url: true,
        pillar: {
          select: {
            name: true,
          },
        },
        subpillar: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      ...event,
      pillar: event.pillar ? event.pillar.name : 'Lainnya',
      subpillar: event.subpillar ? event.subpillar.name : 'Lainnya',
    };
  }

  async getEvent(id_or_slug: string) {
    const event = await this.prisma.event.findFirst({
      where: {
        OR: [
          {
            event_id: id_or_slug,
          },
          {
            slug: id_or_slug,
          },
        ],
      },
      select: {
        event_id: true,
        slug: true,
        type: true,
        image_url: true,
        title: true,
        start: true,
        end: true,
        location: true,
        detail: true,
        map_url: true,
        payment_url: true,
        created_at: true,
        created_by: true,
        is_active: true,
        pillar: {
          select: {
            name: true,
          },
        },
        subpillar: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      ...event,
      pillar: event.pillar ? event.pillar.name : 'Lainnya',
      subpillar: event.subpillar ? event.subpillar.name : 'Lainnya',
    };
  }

  async createEvent(body: CreateEventDto, file: Express.Multer.File) {
    const key = `events/${Date.now()}-${file.originalname}`;

    const url = await this.storage.uploadFile({
      buffer: file.buffer,
      bucket: 'jakartapastisehat',
      key,
      mimetype: file.mimetype,
    });

    return this.prisma.event.create({
      data: {
        event_id: `${PREFIX['EVENT']}${random(100000, 999999)}`,
        slug: slug(body.title),
        title: body.title,
        pillar_id: body.pillar_id,
        sub_pillar_id: body.sub_pillar_id,
        image_key: key,
        image_url: url,
        start: body.start,
        end: body.end,
        detail: body.detail,
        location: body.location,
        map_url: body.map_url,
        payment_url: body.payment_url,
        type: body.type,
        created_by: body.by,
        updated_by: body.by,
      },
      select: {
        event_id: true,
      },
    });
  }

  async updateEvent(body: UpdateEventDto, file: Express.Multer.File) {
    const event = await this.prisma.event.findUnique({
      where: { event_id: body.event_id },
      select: { image_key: true },
    });

    if (!event) {
      throw new NotFoundException('Event tidak ditemukan');
    }

    if (file) {
      const key = `events/${Date.now()}-${file.originalname}`;

      const url = await this.storage.uploadFile({
        buffer: file.buffer,
        bucket: 'jakartapastisehat',
        key,
        mimetype: file.mimetype,
      });

      await this.storage.deleteFile({
        bucket: 'jakartapastisehat',
        key: event.image_key,
      });

      return this.prisma.event.update({
        where: {
          event_id: body.event_id,
        },
        data: {
          slug: body.title ? slug(body.title) : undefined,
          title: body.title,
          pillar_id: body.pillar_id,
          sub_pillar_id: body.sub_pillar_id,
          image_key: key,
          image_url: url,
          start: body.start,
          end: body.end,
          detail: body.detail,
          location: body.location,
          map_url: body.map_url,
          payment_url: body.payment_url,
          type: body.type,
          is_active: body.is_active
            ? body.is_active === 'true'
              ? true
              : false
            : undefined,
          updated_by: body.by,
        },
        select: {
          event_id: true,
        },
      });
    }

    return this.prisma.event.update({
      where: {
        event_id: body.event_id,
      },
      data: {
        slug: body.title ? slug(body.title) : undefined,
        title: body.title,
        pillar_id: body.pillar_id,
        sub_pillar_id: body.sub_pillar_id,
        start: body.start,
        end: body.end,
        detail: body.detail,
        location: body.location,
        map_url: body.map_url,
        payment_url: body.payment_url,
        type: body.type,
        is_active: body.is_active
          ? body.is_active === 'true'
            ? true
            : false
          : undefined,
        updated_by: body.by,
      },
      select: {
        event_id: true,
      },
    });
  }

  async deleteEvent(event_id: string) {
    const event = await this.prisma.event.findUnique({
      where: { event_id },
      select: { image_key: true },
    });

    if (!event) {
      throw new NotFoundException('Event tidak ditemukan');
    }

    await this.storage.deleteFile({
      bucket: 'jakartapastisehat',
      key: event.image_key,
    });

    return this.prisma.event.delete({
      where: { event_id },
      select: {
        event_id: true,
      },
    });
  }
}
