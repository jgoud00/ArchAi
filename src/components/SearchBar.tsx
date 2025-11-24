import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { Project } from '@/types'

interface SearchFilters {
  status?: 'active' | 'completed' | 'archived'
  dateFrom?: string
  dateTo?: string
  budgetUsage?: 'under' | 'over' | 'all'
}

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void
  projects: Project[]
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})

  const handleSearch = () => {
    onSearch(query, filters)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onSearch(query, newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    setQuery('')
    onSearch('', {})
  }

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name, description..."
            className="pl-10"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              onSearch(e.target.value, filters)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        {(query || activeFilterCount > 0) && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.status || 'all'}
                onChange={(e) => {
                  const value = e.target.value === 'all' ? undefined : e.target.value
                  handleFilterChange('status', value)
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date From</label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date To</label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Budget Usage</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.budgetUsage || 'all'}
                onChange={(e) => {
                  const value = e.target.value === 'all' ? undefined : e.target.value
                  handleFilterChange('budgetUsage', value)
                }}
              >
                <option value="all">All</option>
                <option value="under">Under Budget</option>
                <option value="over">Over Budget</option>
              </select>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

