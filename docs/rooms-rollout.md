# Rooms/Locations Rollout Notes

This document tracks the rollout steps and follow-ups for the centrally managed Rooms/Locations feature.

## Backend

- Model: RoomLocation (campus+name unique, active flag)
- Endpoints:
  - GET /rooms (auth) → List active rooms, optional campus filter
  - Admin (SDU roles):
    - GET /admin/rooms → search/filter
    - POST /admin/rooms → create
    - PATCH /admin/rooms/:id → update
    - PATCH /admin/rooms/:id/active → deactivate/reactivate
- Audit logs:
  - room.create/update/deactivate/reactivate
  - schedule.room.assign (on create with venue)
  - schedule.room.change (on update when venue changed)

## Frontend

- SDU Admin UI: Rooms/Locations management
  - Path: /SDU/rooms
  - Features: list, search, filter by status, add/edit, deactivate/reactivate
- Activity Logs
  - Labels added for room.* and schedule.room.*
- Student Leader → Add New Proposal
  - Venue select now pulls from GET /rooms (active only)
  - "Other" fallback still available for edge cases

## Migration/Backfill

- Optional backfill for legacy venue strings to linked RoomLocation documents:
  - Extract distinct venue values from ProposalConduct.ProposedIndividualActionPlan.venue
  - Match by normalized name to existing RoomLocation entries
  - For unknowns, create RoomLocation records (inactive by default) for SDU to validate

## Next Integrations

- Replace venue inputs in other creation/edit forms (if any) with rooms select
- Add campus-scoped filtering if campus is known in context
- Add small toasts in UI for room CRUD operations
- Pagination and sorting in admin rooms list if volume grows

## Testing Checklist

- [ ] Admin creates/edits/deactivates a room, actions appear in Activity Logs
- [ ] Student Leader sees room names in Venue dropdown and can submit
- [ ] Updating a proposal's venue logs schedule.room.change with from/to
- [ ] GET /rooms respects auth and returns only active rooms

