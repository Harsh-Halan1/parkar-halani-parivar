// File: backend/src/events/event-notifications.service.ts
// Handle event-triggered notifications and suggestions

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { EventType, RelationType } from '@prisma/client';

interface EventSuggestion {
  eventId: string;
  eventType: EventType;
  personId: string;
  personName: string;
  suggestedUpdates: string[];
  message: string;
}

@Injectable()
export class EventNotificationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate update suggestions based on event type
   * BIRTH: Suggest updating family relationships, adding child to parents
   * DEATH: Suggest marking person as deceased, updating family tree
   */
  async generateEventSuggestions(eventId: string): Promise<EventSuggestion> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        person: {
          include: {
            family: true,
          },
        },
        createdBy: true,
      },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const personName = `${
      ((event.person.firstName as any)?.en ||
        (event.person.firstName as any)?.gu ||
        'Person') as string
    }`;
    const suggestions: EventSuggestion = {
      eventId: event.id,
      eventType: event.type,
      personId: event.person.id,
      personName,
      suggestedUpdates: [],
      message: '',
    };

    switch (event.type) {
      case EventType.BIRTH:
        suggestions.suggestedUpdates = [
          'Update parents\' relationships - link parents to newborn',
          'Add birth date details to the person\'s profile',
          'Update family tree with new member',
          'Add birth place and medical information if available',
        ];
        suggestions.message = `Birth event recorded for ${personName}. Consider updating their profile with birth details and linking to parents.`;
        break;

      case EventType.DEATH:
        suggestions.suggestedUpdates = [
          'Mark person as deceased in their profile',
          'Add death date to profile',
          'Update family relationships (mark spouse, children status)',
          'Add death place and cause of death if available',
          'Create memorial/tribute announcement for family',
        ];
        suggestions.message = `Death event recorded for ${personName}. Please update their profile to reflect this in the family tree.`;
        break;

      case EventType.BIRTHDAY:
        suggestions.suggestedUpdates = [
          'Verify birth date is correct in profile',
          'Update age and other life milestones if needed',
        ];
        suggestions.message = `Birthday event for ${personName}. Verify birth details are up to date.`;
        break;

      case EventType.ACHIEVEMENT:
        suggestions.suggestedUpdates = [
          'Add detailed achievement information to profile',
          'Update education/career information',
        ];
        suggestions.message = `Achievement recorded for ${personName}.`;
        break;

      default:
        suggestions.suggestedUpdates = [
          'Review event details',
          'Update related person information if needed',
        ];
        suggestions.message = `Event recorded for ${personName}.`;
    }

    return suggestions;
  }

  /**
   * Get all pending suggestions for a family
   * Used to show notifications in frontend
   */
  async getPendingSuggestions(familyId: string) {
    // Get recent events that might need follow-up
    const recentEvents = await this.prisma.event.findMany({
      where: {
        person: {
          familyId,
        },
        type: {
          in: [EventType.BIRTH, EventType.DEATH],
        },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      include: {
        person: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const suggestions: EventSuggestion[] = [];

    for (const event of recentEvents) {
      const suggestion = await this.generateEventSuggestions(event.id);
      suggestions.push(suggestion);
    }

    return suggestions;
  }

  /**
   * Mark a suggestion as acknowledged (optional - for tracking)
   */
  async acknowledgeSuggestion(eventId: string, userId: string) {
    // This could store in a separate table to track which suggestions users have seen
    // For now, we'll just log this action
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'ACKNOWLEDGE_EVENT_SUGGESTION',
        entity: 'EVENT',
        entityId: eventId,
      },
    });

    return { success: true, message: 'Suggestion acknowledged' };
  }

  /**
   * Get profile update progress for a person after an event
   * Shows what information still needs to be updated
   */
  async getProfileUpdateProgress(personId: string, eventType: EventType) {
    const person = await this.prisma.person.findUnique({
      where: { id: personId },
    });

    if (!person) {
      throw new Error('Person not found');
    }

    let progress = {
      eventType,
      personId,
      completedUpdates: [] as string[],
      pendingUpdates: [] as string[],
      completionPercentage: 0,
    };

    if (eventType === EventType.BIRTH) {
      // Check what birth-related info is filled
      if (person.dateOfBirth) progress.completedUpdates.push('Birth date');
      else progress.pendingUpdates.push('Birth date');

      if (person.placeOfBirth) progress.completedUpdates.push('Birth place');
      else progress.pendingUpdates.push('Birth place');

      // Check if relationships are established (parents)
      const parentRelationships = await this.prisma.relationship.findMany({
        where: {
          personBId: personId,
          relationType: RelationType.PARENT,
        },
      });

      if (parentRelationships.length > 0) {
        progress.completedUpdates.push('Parent relationships');
      } else {
        progress.pendingUpdates.push('Parent relationships');
      }
    } else if (eventType === EventType.DEATH) {
      // Check death-related fields
      if (person.isDeceased) progress.completedUpdates.push('Marked as deceased');
      else progress.pendingUpdates.push('Mark as deceased');

      if (person.dateOfDeath) progress.completedUpdates.push('Death date');
      else progress.pendingUpdates.push('Death date');

      if (person.placeOfDeath) progress.completedUpdates.push('Death place');
      else progress.pendingUpdates.push('Death place');
    }

    progress.completionPercentage = Math.round(
      (progress.completedUpdates.length /
        (progress.completedUpdates.length + progress.pendingUpdates.length)) *
        100
    );

    return progress;
  }
}
