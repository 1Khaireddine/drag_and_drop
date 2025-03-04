class TasksController < ApplicationController
  def index
    @agents = Agent.all
    @unassigned_tasks = Task.where(agent_id: nil)
    @assigned_tasks = Task.where.not(agent_id: nil)
    respond_to do |format|
      format.html
      format.json { render json: { tasks: serialized_tasks(@assigned_tasks) } }
    end
  end

  def update
    @task = Task.find(params[:id])
    if @task.update(task_params)
      render json: { status: 'success', task: @task }
    else
      render json: { status: 'error', errors: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def serialized_tasks(tasks)
    tasks.map do |task|
      {
        id: task.id,
        resourceId: task.agent_id ? "agent-#{task.agent_id}" : nil,
        title: task.name,
        start: task.start_time,
        end: task.end_time,
      }
    end
  end

  def task_params
    params.require(:task).permit(:agent_id, :start_time, :end_time)
  end
end
