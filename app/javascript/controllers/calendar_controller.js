import { Controller } from "@hotwired/stimulus";
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";

export default class extends Controller {
  static targets = ["calendar"];

  static values = {
    agentId: String,
  }

  connect() {
    this.initExternalEvents();
    this.initCalendar();
  }

  setDefaultAgent(event) {
    this.agentIdValue = event.target.value;
    this.fetchAgentTasks();
  }


  fetchAgentTasks() {
    let agentId = this.agentIdValue;
    if (!agentId) return;

    let url = `/agents/${agentId}/tasks`;

    fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched tasks:", data);
        this.reinitializeCalendar(data);
      })
      .catch((error) => console.error("Error fetching tasks:", error));
  }

  reinitializeCalendar(tasks) {
    if (this.calendar) {
      this.calendar.destroy();
    }

    this.initCalendar();

    if (this.calendar) {
      tasks.forEach((task) => {
        let eventData = {
          id: task.id,
          title: task.title,
          startTime: task.start_at.split("T")[1].slice(0, 5),
          endTime: task.finish_at.split("T")[1].slice(0, 5),
          daysOfWeek: task.days,
          startRecur: task.start_on,
          endRecur: task.finish_on,
          editable: false,
          extendedProps: task,
        };

        this.calendar.addEvent(eventData);
      });
    }
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
          daysOfWeek: eventData.days,
          startRecur: eventData.start_on,
          endRecur: eventData.finish_on,
          editable: false,
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
        right: "dayGridMonth,timeGridWeek",
      },
      selectable: true,
      editable: true,
      droppable: true,
      eventReceive: this.handleEventReceive.bind(this),
      eventClick: this.unscheduleEvent.bind(this),
    });

    this.calendar.render();
  }

  handleEventReceive(info) {
    console.log("Event dropped into calendar:", info.event);
    this.applyDefaultSchedule(info);
    this.removeExternalTask(info.draggedEl);
  }

  applyDefaultSchedule(info) {
    let event = info.event;
    let defaultParams = event.extendedProps;

    event.setProp("editable", false);

    if (defaultParams.days_of_week) {
      let newEvent = {
        title: event.title,
        startTime: defaultParams.start_at,
        endTime: defaultParams.finish_at,
        daysOfWeek: defaultParams.days_of_week,
        startRecur: defaultParams.start_date,
        endRecur: defaultParams.end_date,
        editable: false,
      };

      this.calendar.addEvent(newEvent);
      event.remove();
    }
  }

  removeExternalTask(task) {
    let externalTasks = document.getElementById("external-tasks");
    let taskElements = externalTasks.getElementsByClassName("fc-event");

    for (let item of taskElements) {
      if (item.id === task.id) {
        task.remove();
        break;
      }
    }
  }

  unscheduleEvent(info) {
    let event = info.event;
    let externalTasks = document.getElementById("external-tasks");

    let typeData = event._def.recurringDef?.typeData || {};

    const msToTime = (ms) => {
      let date = new Date(ms);
      return date.toISOString().substr(11, 5);
    };
    let eventData = {
      title: event.title,
      days_of_week: typeData.daysOfWeek,
      start_date: typeData.startRecur ? new Date(Date.parse(typeData.startRecur)).toISOString().split("T")[0] : null,
      end_date: typeData.endRecur ? new Date(Date.parse(typeData.endRecur)).toISOString().split("T")[0] : null,
      start_at: msToTime(typeData.startTime.milliseconds),
      finish_at: msToTime(typeData.endTime.milliseconds),
    };

    let taskElement = document.createElement("div");
    taskElement.classList.add("fc-event");
    taskElement.id = `task-${event.id}`;

    taskElement.dataset.event = JSON.stringify(eventData);

    let titleDiv = document.createElement("div");
    titleDiv.textContent = event.title;
    taskElement.appendChild(titleDiv);

    let dateDiv = document.createElement("div");
    dateDiv.textContent = `${eventData.start_date} - ${eventData.finish_at}`;
    taskElement.appendChild(dateDiv);

    externalTasks.appendChild(taskElement);

    event.remove();
  }

}
