import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ClassService } from './class.service';
import { CreateClassDto, UpdateClassDto } from './dto';

@ApiTags('Classes')
@Controller('classes')
export class ClassController {
  constructor(private readonly service: ClassService) {}

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
    return this.service.create(createClassDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all classes' })
  @ApiResponse({
    status: 200,
    description: 'Return all classes with their associated sports.',
    type: [CreateClassDto],
  })
  findAll() {
    return this.service.findAll();
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
    return this.service.findOne(id);
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
    return this.service.update(id, updateClassDto);
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
    return this.service.remove(id);
  }
}
