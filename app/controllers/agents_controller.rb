class AgentsController < ApplicationController
  def index
    @agents = Agent.all
    respond_to do |format|
      format.json { render json: @agents }
    end
  end
end
