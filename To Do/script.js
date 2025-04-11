document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById("taskInput");
    const taskTime = document.getElementById("taskTime");
    const addTaskButton = document.getElementById("addTaskButton");
    const taskList = document.getElementById("taskList");
    const clearAllButton = document.getElementById("clearAllButton");
    const filterTasks = document.getElementById("filterTasks");
  
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  
    // Request notification permission
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  
    // Save tasks to localStorage
    const saveTasks = () => {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    };
  
    // Render tasks
    const renderTasks = (filter = "all") => {
      taskList.innerHTML = "";
      const filteredTasks = tasks.filter(task => {
        if (filter === "completed") return task.completed;
        if (filter === "pending") return !task.completed;
        return true;
      });
  
      filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = task.completed ? "completed" : "";
        li.innerHTML = `
          <span class="task-text">${task.text}</span>
          <span class="task-time">${task.time || "No time set"}</span>
          <button class="delete-task" aria-label="Delete task">Delete</button>
        `;
  
        // Toggle complete
        li.querySelector(".task-text").addEventListener("click", () => {
          task.completed = !task.completed;
          saveTasks();
          renderTasks(filterTasks.value);
        });
  
        // Delete task
        li.querySelector(".delete-task").addEventListener("click", () => {
          tasks = tasks.filter(t => t !== task);
          saveTasks();
          renderTasks(filterTasks.value);
        });
  
        taskList.appendChild(li);
      });
    };
  
    // Add task
    addTaskButton.addEventListener("click", () => {
      const taskText = taskInput.value.trim();
      const taskTimeValue = taskTime.value;
  
      if (taskText === "") {
        alert("Task cannot be empty!");
        return;
      }
  
      const task = { text: taskText, time: taskTimeValue, completed: false };
      tasks.push(task);
      saveTasks();
      renderTasks(filterTasks.value);
  
      // Set notification if time is provided
      if (taskTimeValue) {
        const now = new Date();
        const [hours, minutes] = taskTimeValue.split(":").map(Number);
        const taskDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  
        const delay = taskDate - now;
        if (delay > 0) {
          setTimeout(() => {
            new Notification("Task Reminder", {
              body: `It's time for: ${taskText}`,
            });
          }, delay);
        }
      }
  
      taskInput.value = "";
      taskTime.value = "";
    });
  
    // Clear all tasks
    clearAllButton.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all tasks?")) {
        tasks = [];
        saveTasks();
        renderTasks(filterTasks.value);
      }
    });
  
    // Filter tasks
    filterTasks.addEventListener("change", () => {
      renderTasks(filterTasks.value);
    });
  
    // Remove expired tasks
    const removeExpiredTasks = () => {
      const now = new Date();
      tasks = tasks.filter(task => {
        if (!task.time) return true; // Keep tasks without a time
        const [hours, minutes] = task.time.split(":").map(Number);
        const taskDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        return taskDate > now; // Keep tasks that are still in the future
      });
      saveTasks();
      renderTasks(filterTasks.value);
    };
  
    // Run the expired task removal every minute
    setInterval(removeExpiredTasks, 60000);
  
    // Initial render
    renderTasks();
  });