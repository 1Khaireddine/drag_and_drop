class CreateTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :tasks do |t|
      t.string :title
      t.string :description
      t.date :start_on
      t.date :finish_on
      t.bigint :agent_id, null: true

      t.timestamps
    end
  end
end
