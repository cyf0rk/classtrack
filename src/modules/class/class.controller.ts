import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ClassService } from './class.service';
import { CreateClassDto, UpdateClassDto } from './dto';
import { GetClassesQueryDto } from './dto/get-classes-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from 'db';
import { ApplicationService } from '../application/application.service';

@ApiTags('Classes')
@Controller('classes')
export class ClassController {
  constructor(
    private readonly classService: ClassService,
    private readonly applicationService: ApplicationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new class' })
  @ApiBody({ type: CreateClassDto })
  @ApiResponse({
    status: 201,
    description: 'The class has been successfully created.',
    type: CreateClassDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  create(@Body() createClassDto: CreateClassDto) {
    return this.classService.create(createClassDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all classes' })
  @ApiQuery({ type: GetClassesQueryDto })
  @ApiResponse({
    status: 200,
    description: 'Return all classes with their associated sports.',
    type: [CreateClassDto],
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid sports format. Must be comma-separated alphabetic values.',
  })
  findAll(@Query() query: GetClassesQueryDto) {
    if (!query?.sports) {
      return this.classService.findAll();
    }
    return this.classService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a class by id' })
  @ApiParam({ name: 'id', type: 'number', description: 'Class ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the class with the specified id.',
    type: CreateClassDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid ID format.' })
  @ApiResponse({ status: 404, description: 'Class not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a class' })
  @ApiParam({ name: 'id', type: 'number', description: 'Class ID' })
  @ApiBody({ type: UpdateClassDto })
  @ApiResponse({
    status: 200,
    description: 'The class has been successfully updated.',
    type: CreateClassDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Class not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    return this.classService.update(id, updateClassDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a class' })
  @ApiParam({ name: 'id', type: 'number', description: 'Class ID' })
  @ApiResponse({
    status: 200,
    description: 'The class has been successfully deleted.',
    type: CreateClassDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid ID format.' })
  @ApiResponse({ status: 404, description: 'Class not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.classService.remove(id);
  }

  @Get(':id/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findClassApplications(@Param('id', ParseIntPipe) id: number) {
    return await this.applicationService.findClassApplications(id);
  }
}
