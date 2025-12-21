-- Helper function to increment question count
create or replace function increment_question_count(session_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update interview_sessions
  set total_questions = total_questions + 1
  where id = session_id;
end;
$$;
