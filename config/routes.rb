# config/routes.rb
Rails.application.routes.draw do
  resources :tasks
  resources :agents do
    member do
      get :tasks
    end
  end
  root "tasks#index"
end
