export async function createCalendarEvent(accessToken, task, attendees = []) {
  if (!accessToken) return null;

  try {
    const startDateTime = task.start_d ? new Date(task.start_d).toISOString() : new Date().toISOString();
    // Default to 1 hour event if no end_d
    const endDateTime = task.end_d ? new Date(task.end_d).toISOString() : new Date(Date.now() + 3600 * 1000).toISOString();

    const body = {
      summary: task.title,
      description: task.descrption || "",
      start: {
        dateTime: startDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    if (attendees && attendees.length > 0) {
      body.attendees = attendees.map(email => ({ email }));
    }

    const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Calendar Create Event API Error:", errorText);
      return null;
    }

    const event = await response.json();
    return event.id;
  } catch (error) {
    console.error("Error creating Google Calendar event:", error);
    return null;
  }
}

export async function updateCalendarEvent(accessToken, gcalEventId, task) {
  if (!accessToken || !gcalEventId) return false;

  try {
    const startDateTime = task.start_d ? new Date(task.start_d).toISOString() : new Date().toISOString();
    const endDateTime = task.end_d ? new Date(task.end_d).toISOString() : new Date(Date.now() + 3600 * 1000).toISOString();

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${gcalEventId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        summary: task.title,
        description: task.descrption || "",
        start: {
          dateTime: startDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Calendar Update Event API Error:", errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating Google Calendar event:", error);
    return false;
  }
}

export async function deleteCalendarEvent(accessToken, gcalEventId) {
  if (!accessToken || !gcalEventId) return false;

  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${gcalEventId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Calendar Delete Event API Error:", errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting Google Calendar event:", error);
    return false;
  }
}
