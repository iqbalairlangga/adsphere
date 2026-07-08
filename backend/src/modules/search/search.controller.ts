import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Search')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search' })
  async search(@Query('q') q: string, @Query('type') type: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.searchService.search(q, type, page, limit);
  }
}
