Rails.application.routes.draw do
  resources :tasks do
    member do
      post :assign
      get :unassign
    end
  end

  resources :agents do
    member do
      get :tasks
    end
  end

  root "tasks#index"
end
