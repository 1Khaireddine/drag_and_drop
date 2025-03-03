class Task < ApplicationRecord
  belongs_to :agent, optional: true
end
