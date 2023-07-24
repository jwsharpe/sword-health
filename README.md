## To run

This server runs on the docker-compose file. For initial setup, run the following commands.

`docker-compose up -d`

`yarn && yarn seed`

## Summary

This is the sword-health backend. An application for a ticketing system for technicians and managers. It runs a general web server using Express, a MySQL db in the back, and RabbitMQ for messaging the notification system.

The body of the webserver is running from the api/v1/index.js file. The folder structure is setup to be MVC-adjacent. Routes are found in routes/ controllers are found in controllers/ etc. Tests for most of the logic is in the directory of the same name but under tests/api/v1/.

Tests can be ran with
`yarn test`

Below is much of the tech spec of the entire document. (Along with personal commentary and notes written in parenthesis)

## Glossary

Managers - role that have hierarchy over technicians, can see all tasks from technicians, delete specific tasks and are notified when a task is performed.

Technician - role that has hierarchy over tasks, can see all of their own tasks, and is able to create or update their own performed tasks.

(A task will refer to a performed and completed task. A feature that could be asked for in the future is the ability to create and update tasks that have varing levels of completeness, this progress field that might include things such as, READIED, IN PROGRESS, COMPLETED, ETC. For the purposes of this exercise this field is left out in order to avoid feature assumptions.)
Task - A performed task, this tasks contains a summary (2500 char max), a date when it was performed, and a date when the task was most recently updated. This summary can contain personal information

## Role Requirements

Managers and Technicians

(For security purposes, roles will have permissions only aligned to their explicit description in the requirements. This means, managers can only view and delete tasks. This also means, technicians can only view/create/update as well. In a real world scenario, we might expect managers to ask to be able to update / create tasks on behalf of their technicians, but we will keep things tight in order to best align to security principals)

(Although not stated in the requirements, we will assume there could be multiple independent managers. Instead of a manager being able to view "all" technicians, a manager will be able to view all of their direct technicians. We will prevent managers from viewing and deleting tasks of technicians that are not under them. We will also assume that technicians work solely under a single manager. Features that are outside the scope of this work would include the ability to contact an API to CRUD managers / technicians)
Managers

- View all tasks from all of their Technicians
- Delete tasks from their Technicians

Technicians

- View performed tasks
- Create performed tasks
- Update performed tasks summary and/or title
  (Technicians can only update the tasks' summaries and titles. The created date field is an automatically generated field that will act as the performed date. Since we are working with already performed tasks this restriction could be expected and will give us a cleaner and more secure API. This restriction does prevent the API from creating backfilled tickets. This tradeoff is an implementation detail that would have to be discussed with the PM or Client, but I could see the conversation going either way.)

## Database Tables

(All tables are given an automatically generated id, created_date, and updated_date row. The cost is low to add the dates to these rows and I find it is beneficial incase we would ever need to track things datewise in a database.)
Managers
id - int - primary key
name - varchar(255)
created_date - date - default current_date
updated_date - date - default current_date on update current_date

Technicians
id - int
name - varchar(255)
managerId - int - foreign key for managers@id
createdDate - date - default current_date
updatedDate - date - default current_date on update current_date

(Int is used for the id type for this tasks' table for simplicity, we could use bigint if we expect this to scale fast. But doing some napkin math produces:
If 100 Technicians perform 1 task an hour, with 8 hours in a working day, it will take 2147483647 / (100 _ 8) / 365 => 7354 years to run out of signed integers.
1000 Technicians perform 8 tasks a day, will take 735 years
10000 techs _ 8 => will take 73 years.
I am okay with this scaling and making the assumption that this is a relatively low read/write product.)
Tasks
id - int
title - varchar(255)
summary - text (we will fill this with encrypted data with the key stored separately, incase this db is compromised, an attacker will not be able to get ahold of PII.)
technicianId - int - foreign key for managers@id
(Instead of deleting rows, we can add a deleted date to emulate this. I prefer this over deleting rows so that this db can be used as the single source of truth to these events and as a tool for reporting.)
deletedDate - date
createdDate - date - default current_date
updatedDate - date - default current_date on update current_date

## Authentication

Authentication is mocked in the style of API-Keys.
(These keys are typically pretty effective and expandable to stronger security practices if need be. Generally, I was looking for a proper suite to create a more in-depth and safe security system, but given teh time frame I did not want to rush authentication.)

Generation of an api-key is currently human doable. To create an api key to mock a user the following format is used.

```
role-roleId
```

For example Manager 1's key would be

```
manager-1
```

Technician 9 would be

```
technician-9
```

## Endpoints

GET `/v1/tasks`
headers: { x-api-key: String }

- if a technician calls this endpoint, return their completed tasks
- if a manager calls this endpoint, return their technicians tasks
- expected responses
  - 200: ok, returns tasks given user credentials
  - 400: bad request - malformed request
  - 401: unauthorized request - identity is not known
  - 403: forbidden - incase identity is known
  - 404: not found

GET `/v1/tasks/:task_id`
params: { task_id: Integer }
headers: { x-api-key: String }

- a technician or manager must have the appropriate security to return a task
- expected responses
  - 200: ok, returns task
  - 400: bad request
  - 401: unauthorized
  - 403: forbidden
  - 404: not found

POST `/v1/tasks/`
headers: { x-api-key: String }
body: { title: String, summary: String }

- a technician should call this endpoint to create a performed task
- a notification should be sent to the manager on creation
  - "The tech X performed task Y on date Z"
- expected responses
  - 201: created, return task
  - 400: bad request - if required fields are missing
  - 401: unauthorized - if identity is not known
  - 403: forbidden - if a manager attempts to create a task

PATCH `/v1/tasks/:task_id`
params: { task_id: Integer }
headers: { x-api-key: String }
body: { title: String - Optional, summary: String - Optional }

- technicians should call this endpoint to update a task
- expected responses
  - 200: OK, returns task
  - 400: bad request - if required fields are missing or attempted to update a deleted task
  - 401: unauthorized - if identity is not known
  - 403: forbidden - if a manager attempts to update a task
  - 404: not found - if a task does not exist

DELETE `/v1/tasks/:task_id`
headers: { x-api-key: String }

- a manager should call this endpint to delete a task
- expected responses
  - 200: OK, returns task
  - 401: unauthorized - if identity is not known
  - 403: forbidden - if a technician attempts to delete a task
  - 404: not found - if a task does not exist
