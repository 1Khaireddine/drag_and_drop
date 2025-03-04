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

  def assign
    task = Task.find(params[:task_id])
    agent = Agent.find(params[:agent_id])

    if task.update(agent: agent)
      render json: { success: true, task: task }, status: :ok
    else
      render json: { success: false, errors: task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def unassign
    task = Task.find(params[:id])

    if task.update(agent: nil)
      render json: { success: true, task: task }, status: :ok
    else
      render json: { success: false, errors: task.errors.full_messages }, status: :unprocessable_entity
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
