import { Injectable, NotFoundException } from '@nestjs/common';
import { random } from 'lodash';
import { PREFIX } from '../utils/constant.util';
import { PrismaService } from '../utils/services/prisma.service';
import { StorageService } from '../utils/services/storage.service';
import { getReadingTimeFromHTML, slug } from '../utils/string.util';
import {
  ArticlesQuery,
  CreateArticleDto,
  UpdateArticleDto,
} from './articles.dto';

@Injectable()
export class ArticlesService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async getPublicArticles(query: ArticlesQuery) {
    const default_page = 1;
    const take = 8;

    const page = query.page ? parseInt(query.page) : default_page;

    const skip = (page - 1) * take;

    const [total_articles, articles] = await this.prisma.$transaction([
      this.prisma.article.count({
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
      this.prisma.article.findMany({
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
          article_id: true,
          slug: true,
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
          content: true,
          title: true,
          description: true,
          image_url: true,
          created_at: true,
        },
        orderBy: {
          created_at: 'desc',
        },
        take,
        skip,
      }),
    ]);

    return {
      articles: articles.map((article) => {
        return {
          ...article,
          pillar: article.pillar ? article.pillar.name : 'Lainnya',
          subpillar: article.subpillar ? article.subpillar.name : 'Lainnya',
          reading_time: getReadingTimeFromHTML(article.content),
        };
      }),
      page: articles.length ? page : 0,
      total_articles,
      total_pages: Math.ceil(total_articles / take),
    };
  }

  async getArticles(query: ArticlesQuery) {
    const default_page = 1;
    const take = 8;

    const page = query.page ? parseInt(query.page) : default_page;

    const skip = (page - 1) * take;

    const [total_articles, articles] = await this.prisma.$transaction([
      this.prisma.article.count({
        where: {
          title: {
            contains: query.q,
          },
        },
      }),
      this.prisma.article.findMany({
        where: {
          title: {
            contains: query.q,
          },
        },
        select: {
          article_id: true,
          slug: true,
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
          content: true,
          title: true,
          description: true,
          image_url: true,
          created_at: true,
        },
        orderBy: {
          created_at: 'desc',
        },
        take,
        skip,
      }),
    ]);

    return {
      articles: articles.map((article) => {
        return {
          ...article,
          pillar: article.pillar ? article.pillar.name : 'Lainnya',
          subpillar: article.subpillar ? article.subpillar.name : 'Lainnya',
          reading_time: getReadingTimeFromHTML(article.content),
        };
      }),
      page: articles.length ? page : 0,
      total_articles,
      total_pages: Math.ceil(total_articles / take),
    };
  }

  async getArticle(id_or_slug: string) {
    const article = await this.prisma.article.findFirst({
      where: {
        OR: [
          {
            article_id: id_or_slug,
          },
          {
            slug: id_or_slug,
          },
        ],
      },
      select: {
        article_id: true,
        slug: true,
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
        content: true,
        title: true,
        description: true,
        image_url: true,
        created_at: true,
        created_by: true,
      },
    });

    return {
      ...article,
      pillar: article.pillar ? article.pillar.name : 'Lainnya',
      subpillar: article.subpillar ? article.subpillar.name : 'Lainnya',
      reading_time: getReadingTimeFromHTML(article.content),
    };
  }

  async createArticle(body: CreateArticleDto, file: Express.Multer.File) {
    const key = `articles/${Date.now()}-${file.originalname}`;

    const url = await this.storage.uploadFile({
      buffer: file.buffer,
      bucket: 'jakartapastisehat',
      key,
      mimetype: file.mimetype,
    });

    return this.prisma.article.create({
      data: {
        article_id: `${PREFIX['ARTICLE']}${random(100000, 999999)}`,
        title: body.title,
        slug: slug(body.title),
        pillar_id: body.pillar_id,
        sub_pillar_id: body.sub_pillar_id,
        content: body.content,
        description: body.description,
        image_key: key,
        image_url: url,
        created_by: body.by,
        updated_by: body.by,
      },
      select: {
        article_id: true,
      },
    });
  }

  async updateArticle(body: UpdateArticleDto, file: Express.Multer.File) {
    const article = await this.prisma.article.findUnique({
      where: {
        article_id: body.article_id,
      },
      select: {
        image_key: true,
      },
    });

    if (!article) {
      throw new NotFoundException('Artikel tidak ditemukan');
    }

    if (file) {
      const key = `articles/${Date.now()}-${file.originalname}`;

      const url = await this.storage.uploadFile({
        buffer: file.buffer,
        bucket: 'jakartapastisehat',
        key,
        mimetype: file.mimetype,
      });

      await this.storage.deleteFile({
        bucket: 'jakartapastisehat',
        key: article.image_key,
      });

      return this.prisma.article.update({
        where: {
          article_id: body.article_id,
        },
        data: {
          title: body.title,
          slug: body.title ? slug(body.title) : undefined,
          pillar_id: body.pillar_id,
          sub_pillar_id: body.sub_pillar_id,
          content: body.content,
          description: body.description,
          image_key: key,
          image_url: url,
          is_active: body.is_active
            ? body.is_active === 'true'
              ? true
              : false
            : undefined,
          updated_by: body.by,
        },
        select: {
          article_id: true,
        },
      });
    }

    return this.prisma.article.update({
      where: {
        article_id: body.article_id,
      },
      data: {
        title: body.title,
        slug: body.title ? slug(body.title) : undefined,
        pillar_id: body.pillar_id,
        sub_pillar_id: body.sub_pillar_id,
        content: body.content,
        description: body.description,
        is_active: body.is_active
          ? body.is_active === 'true'
            ? true
            : false
          : undefined,
        updated_by: body.by,
      },
      select: {
        article_id: true,
      },
    });
  }

  async deleteArticle(article_id: string) {
    const article = await this.prisma.article.findUnique({
      where: {
        article_id,
      },
      select: {
        image_key: true,
      },
    });

    if (!article) {
      throw new NotFoundException('Artikel tidak ditemukan');
    }

    await this.storage.deleteFile({
      bucket: 'jakartapastisehat',
      key: article.image_key,
    });

    return this.prisma.article.delete({
      where: {
        article_id,
      },
      select: {
        article_id: true,
      },
    });
  }
}
