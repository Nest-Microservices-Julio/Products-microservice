import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from '../common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to the database');
  }

  async create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll({ page, limit }: PaginationDto) {
    const totalPages = await this.product.count({where: { available: true }});
    const lastPage = Math.ceil(totalPages / limit);

    return {
      meta: {
        page,
        total: totalPages,
        lastPage
      },
      data: await this.product.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: { available: true },
      }),
    };
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: { id, available: true },
    })

    if (!product) {
      throw new RpcException({
        message: `Product with id ${id} not found`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return product;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(id: number, { id:__ , ...rest}: UpdateProductDto) {

    await this.findOne(id);

    return this.product.update({
      where: { id },
      data: rest,
    })
  }

  async remove(id: number) {

    await this.findOne(id);

    // return this.product.delete({
    //   where: { id },
    // });

    const product = await this.product.update({
      where: { id },
      data: { available: false },
    });

    return product;
  }

  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids));

    const products = await this.product.findMany({
      where: {
        id: {
          in: ids,
        }
      }
    });

    if (products.length !== ids.length) {
      throw new RpcException({
        message: 'Some products were not found',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return products;
  }
}
