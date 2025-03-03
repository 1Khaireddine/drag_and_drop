# config/routes.rb
Rails.application.routes.draw do
  resources :tasks
  resources :agents
  root "tasks#index"
end
