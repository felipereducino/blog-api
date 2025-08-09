import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post as HttpPost,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private posts: PostsService) {}

  @Get()
  listPublished() {
    return this.posts.findAllPublished();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.posts.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpPost()
  create(@GetUser('sub') userId: string, @Body() dto: CreatePostDto) {
    return this.posts.create(userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @GetUser('sub') userId: string,
    @GetUser('role') role: 'USER' | 'ADMIN',
    @Body() dto: UpdatePostDto,
  ) {
    return this.posts.update(id, userId, role, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser('sub') userId: string,
    @GetUser('role') role: 'USER' | 'ADMIN',
  ) {
    return this.posts.remove(id, userId, role);
  }
}
