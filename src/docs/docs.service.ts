import { Injectable, NotFoundException } from '@nestjs/common';
import { random } from 'lodash';
import { PREFIX } from '../utils/constant.util';
import { PrismaService } from '../utils/services/prisma.service';
import { StorageService } from '../utils/services/storage.service';
import { slug } from '../utils/string.util';
import { CreateDocDto, DocsQuery, UpdateDocDto } from './docs.dto';

@Injectable()
export class DocsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async getPublicDocs(query: DocsQuery) {
    function getOrderBy(filter?: string): { created_at: 'desc' | 'asc' } {
      if (filter === 'desc') return { created_at: 'desc' };
      if (filter === 'asc') return { created_at: 'asc' };
      return { created_at: 'desc' };
    }

    const default_page = 1;
    const take = 9;

    const page = query.page ? parseInt(query.page) : default_page;

    const skip = (page - 1) * take;

    const [total_docs, docs] = await this.prisma.$transaction([
      this.prisma.documentation.count({
        where: {
          is_active: true,
          OR: [
            {
              pillar: {
                slug: {
                  contains:
                    query.filter != 'desc' && query.filter != 'asc'
                      ? query.filter
                      : undefined,
                },
              },
            },
            {
              subpillar: {
                slug: {
                  contains:
                    query.filter != 'desc' && query.filter != 'asc'
                      ? query.filter
                      : undefined,
                },
              },
            },
          ],
        },
        orderBy: getOrderBy(query.filter),
      }),
      this.prisma.documentation.findMany({
        where: {
          is_active: true,
          OR: [
            {
              pillar: {
                slug: {
                  contains:
                    query.filter != 'desc' && query.filter != 'asc'
                      ? query.filter
                      : undefined,
                },
              },
            },
            {
              subpillar: {
                slug: {
                  contains:
                    query.filter != 'desc' && query.filter != 'asc'
                      ? query.filter
                      : undefined,
                },
              },
            },
          ],
        },
        select: {
          doc_id: true,
          slug: true,
          title: true,
          thumbnail_url: true,
          created_at: true,
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
        orderBy: getOrderBy(query.filter),
        take,
        skip,
      }),
    ]);

    return {
      docs: docs.map((doc) => {
        return {
          ...doc,
          pillar: doc.pillar ? doc.pillar.name : 'Lainnya',
          subpillar: doc.subpillar ? doc.subpillar.name : 'Lainnya',
        };
      }),
      page: docs.length ? page : 0,
      total_docs,
      total_pages: Math.ceil(total_docs / take),
    };
  }

  async getDocs(query: DocsQuery) {
    const default_page = 1;
    const take = 9;

    const page = query.page ? parseInt(query.page) : default_page;

    const skip = (page - 1) * take;

    const [total_docs, docs] = await this.prisma.$transaction([
      this.prisma.documentation.count({
        where: {
          title: {
            contains: query.q,
          },
        },
      }),
      this.prisma.documentation.findMany({
        where: {
          title: {
            contains: query.q,
          },
        },
        select: {
          doc_id: true,
          slug: true,
          title: true,
          thumbnail_url: true,
          created_at: true,
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
        orderBy: {
          created_at: 'desc',
        },
        take,
        skip,
      }),
    ]);

    return {
      docs: docs.map((doc) => {
        return {
          ...doc,
          pillar: doc.pillar ? doc.pillar.name : 'Lainnya',
          subpillar: doc.subpillar ? doc.subpillar.name : 'Lainnya',
        };
      }),
      page: docs.length ? page : 0,
      total_docs,
      total_pages: Math.ceil(total_docs / take),
    };
  }

  async getDoc(id_or_slug: string) {
    const doc = await this.prisma.documentation.findFirst({
      where: {
        OR: [
          {
            doc_id: id_or_slug,
          },
          {
            slug: id_or_slug,
          },
        ],
      },
      select: {
        doc_id: true,
        title: true,
        slug: true,
        thumbnail_url: true,
        created_at: true,
        pillar: {
          select: {
            pillar_id: true,
            name: true,
          },
        },
        subpillar: {
          select: {
            sub_pillar_id: true,
            name: true,
          },
        },
        docimg: {
          select: {
            doc_image_id: true,
            image_url: true,
          },
        },
      },
    });

    const { docimg, ...all } = doc;

    delete doc.docimg;

    return {
      ...all,
      pillar: doc.pillar ? doc.pillar : 'Lainnya',
      subpillar: doc.subpillar ? doc.subpillar : 'Lainnya',
      doc_images: docimg,
    };
  }

  async createDoc(
    body: CreateDocDto,
    files: {
      thumbnail?: Express.Multer.File[];
      doc_images?: Express.Multer.File[];
    },
  ) {
    const thumbnail = files.thumbnail[0];
    const doc_images = files.doc_images;

    const key = `doc_thumbnails/${Date.now()}-${thumbnail.originalname}`;
    const doc_id = `${PREFIX['DOCUMENTATION']}${random(100000, 999999)}`;

    const url = await this.storage.uploadFile({
      buffer: thumbnail.buffer,
      bucket: 'jakartapastisehat',
      key,
      mimetype: thumbnail.mimetype,
    });

    await this.prisma.documentation.create({
      data: {
        doc_id,
        slug: slug(body.title),
        title: body.title,
        thumbnail_url: url,
        thumbnail_key: key,
        pillar_id: body.pillar_id,
        sub_pillar_id: body.sub_pillar_id,
        created_by: body.by,
        updated_by: body.by,
      },
    });

    await this.uploadDocImages(doc_images, doc_id, 'create_docs');

    return {
      doc_id,
    };
  }

  async updateDoc(body: UpdateDocDto, file: Express.Multer.File) {
    const docs = await this.prisma.documentation.findUnique({
      where: { doc_id: body.doc_id },
      select: { thumbnail_key: true },
    });

    if (!docs) {
      throw new NotFoundException('Dokumentasi tidak ditemukan');
    }

    if (file) {
      await this.storage.deleteFile({
        bucket: 'jakartapastisehat',
        key: docs.thumbnail_key,
      });

      const key = `doc_thumbnails/${Date.now()}-${file.originalname}`;

      const url = await this.storage.uploadFile({
        buffer: file.buffer,
        bucket: 'jakartapastisehat',
        key,
        mimetype: file.mimetype,
      });

      return this.prisma.documentation.update({
        where: {
          doc_id: body.doc_id,
        },
        data: {
          title: body.title,
          slug: body.title ? slug(body.title) : undefined,
          pillar_id: body.pillar_id,
          sub_pillar_id: body.sub_pillar_id,
          thumbnail_url: url,
          thumbnail_key: key,
          updated_by: body.by,
          is_active: body.is_active
            ? body.is_active === 'true'
              ? true
              : false
            : undefined,
        },
        select: {
          doc_id: true,
        },
      });
    }

    return this.prisma.documentation.update({
      where: {
        doc_id: body.doc_id,
      },
      data: {
        title: body.title,
        slug: body.title ? slug(body.title) : undefined,
        pillar_id: body.pillar_id,
        sub_pillar_id: body.sub_pillar_id,
        updated_by: body.by,
        is_active: body.is_active
          ? body.is_active === 'true'
            ? true
            : false
          : undefined,
      },
      select: {
        doc_id: true,
      },
    });
  }

  async uploadDocImages(
    files: Express.Multer.File[],
    doc_id: string | null,
    type: 'create_docs' | 'create_images',
  ) {
    if (type == 'create_images') {
      if (!(await this.prisma.documentation.count({ where: { doc_id } }))) {
        throw new NotFoundException('Dokumentasi tidak ditemukan');
      }
    }

    const doc_images = [];
    const promises = [];

    for (const file of files) {
      const key = `doc_images/${Date.now()}-${file.originalname}`;
      const bucket = 'jakartapastisehat';

      promises.push(
        this.storage.uploadFile({
          buffer: file.buffer,
          bucket,
          key,
          mimetype: file.mimetype,
        }),
      );

      doc_images.push({
        doc_image_id: `${PREFIX['DOCUMENTATIONIMAGE']}${random(100000, 999999)}`,
        image_key: key,
        image_url: `${process.env.STORAGE_ENDPOINT}/${bucket}/${key}`,
      });
    }

    await this.prisma.documentationImage.createMany({
      data: doc_images.map((img) => {
        return {
          doc_id,
          ...img,
        };
      }),
    });
  }

  async deleteDoc(doc_id: string) {
    const doc = await this.prisma.documentation.findUnique({
      where: {
        doc_id,
      },
      select: {
        thumbnail_key: true,
        docimg: {
          select: {
            image_key: true,
          },
        },
      },
    });

    if (!doc) {
      throw new NotFoundException('Dokumentasi tidak ditemukan');
    }

    const promises = [
      this.storage.deleteFile({
        bucket: 'jakartapastisehat',
        key: doc.thumbnail_key,
      }),
    ];

    for (const image of doc.docimg) {
      promises.push(
        this.storage.deleteFile({
          bucket: 'jakartapastisehat',
          key: image.image_key,
        }),
      );
    }

    await Promise.all(promises);

    return this.prisma.documentation.delete({
      where: { doc_id },
      select: { doc_id: true },
    });
  }

  async deleteDocImage(doc_image_id: string) {
    const doc_image = await this.prisma.documentationImage.findUnique({
      where: {
        doc_image_id,
      },
      select: {
        image_key: true,
      },
    });

    if (!doc_image) {
      throw new NotFoundException('Gambar dokumentasi tidak ditemukan');
    }

    await this.storage.deleteFile({
      bucket: 'jakartapastisehat',
      key: doc_image.image_key,
    });

    return this.prisma.documentationImage.delete({
      where: { doc_image_id },
      select: { doc_image_id: true },
    });
  }
}
