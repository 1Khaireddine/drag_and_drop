import { Controller } from "@hotwired/stimulus";
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";

export default class extends Controller {
  static targets = ["calendar"];

  connect() {
    this.initExternalEvents();
    this.initCalendar();
  }

  initExternalEvents() {
    let externalTasks = document.getElementById("external-tasks");

    new Draggable(externalTasks, {
      itemSelector: ".fc-event",
      eventData: function (el) {
        let eventData = JSON.parse(el.dataset.event);
        console.log("Dragging event:", eventData);
        return {
          title: eventData.title,
          startTime: eventData.start_at,
          endTime: eventData.finish_at,
          daysOfWeek: eventData.days_of_week,
          startRecur: eventData.start_date,
          endRecur: eventData.end_date,
          editable: false, // 🔒 Disable dragging/resizing
          extendedProps: eventData,
        };
      },
    });
  }

  initCalendar() {
    let calendarEl = this.calendarTarget;

    this.calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: "dayGridMonth",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth dayGridWeek",
      },
      selectable: true,
      select: this.applyDefaultSchedule.bind(this),
      editable: true, // 🟢 Can drag external events in
      droppable: true, // Allows external drag & drop
      eventReceive: this.handleEventReceive.bind(this),
      eventClick: this.unscheduleEvent.bind(this), // 🟢 Allow unscheduling
    });

    this.calendar.render();
  }

  handleEventReceive(info) {
    console.log("Event dropped into calendar:", info.event);
    this.applyDefaultSchedule(info);

    // Remove event from external list
    this.removeExternalTask(info.event.title);
  }

  applyDefaultSchedule(info) {
    let event = info.event;
    let defaultParams = event.extendedProps;

    console.log("Dropped event:", event.title, defaultParams);

    // Ensure correct scheduling
    event.setProp("editable", false); // 🔒 Prevent re-scheduling

    if (defaultParams.days_of_week) {
      let newEvent = {
        title: event.title,
        startTime: defaultParams.start_at,
        endTime: defaultParams.finish_at,
        daysOfWeek: defaultParams.days_of_week,
        startRecur: defaultParams.start_date,
        endRecur: defaultParams.end_date,
        editable: false, // 🔒 Disable moving
      };

      this.calendar.addEvent(newEvent);
      event.remove(); // Remove temporary event
    }
  }

  removeExternalTask(title) {
    let externalTasks = document.getElementById("external-tasks");
    let taskElements = externalTasks.getElementsByClassName("fc-event");

    for (let task of taskElements) {
      if (task.textContent.trim() === title.trim()) {
        task.remove();
        console.log("Removed task:", title);
        break;
      }
    }
  }

  unscheduleEvent(info) {
    let event = info.event;
    console.log("Unscheduling event:", event.title);

    // Re-add to external tasks WITHOUT data-event attributes
    let externalTasks = document.getElementById("external-tasks");
    let taskElement = document.createElement("p");
    taskElement.classList.add("fc-event");
    taskElement.textContent = event.title; // ❌ No data-event attribute
    externalTasks.appendChild(taskElement);

    // Remove from calendar
    event.remove();
  }
}
