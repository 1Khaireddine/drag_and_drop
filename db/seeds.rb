# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

10.times do
  Agent.create(
    name: Faker::Name.name,
    email: Faker::Internet.email
  )
end

15.times do
  Task.create(
    title: Faker::Lorem.sentence,
    description: Faker::Lorem.paragraph,
    start_on: Date.today,
    finish_on: Date.today + 1.month,
    start_at: DateTime.current,
    finish_at: DateTime.current + 1.hour,
    days: [0, 1, 2, 3, 4, 5, 6]
  )
end