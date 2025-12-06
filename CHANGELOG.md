# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Project Templates**: Dynamic template creation and management with Admin CRUD.
- **Inventory**: Normalized categories, search, and filter functionality.
- **Calendar**: Task creation modal, drag-and-drop rescheduling, and optimized data fetching.
- **Timeline**: Custom Gantt chart component with drag-and-drop task scheduling.
- **Layout Planner**: Wall drawing with real-world dimensions and grid snapping.
- **3D Model Viewer**: Support for multiple model uploads and version history.
- **Dashboard**: Real-time statistics and KPI cards linked to Supabase data.

### Changed
- **Refactor**: Replaced `frappe-gantt` with custom SVG Gantt chart.
- **Refactor**: Renamed `BlueprintSketcher` to `LayoutPlanner`.
- **Performance**: Optimized Calendar task fetching to solve N+1 query issues.
- **Database**: Normalized `inventory` categories into `inventory_categories` table.

### Fixed
- **Fix**: Resolved build errors related to unused imports.
- **Fix**: Fixed duplicate imports in `Calendar.tsx`.
- **Fix**: Addressed TypeScript `any` type usage in key components.

## [1.0.0] - 2024-01-01

### Initial Release
- Basic Project Management
- Team Collaboration
- Document Storage
- Initial Dashboard
