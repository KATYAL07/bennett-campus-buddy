-- ==============================================================================
-- Campus Buddy - Production Seed Data for Supabase
-- Target: PostgreSQL 15+ / Supabase SQL Editor
-- Safe to re-run: Uses ON CONFLICT DO NOTHING.
-- ==============================================================================

-- 1. Seed Profiles (Fictional student personas + Admin)
INSERT INTO public.profiles (id, email, name, branch, semester, bio, avatar_url, role, is_banned)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'arnav@bennett.edu.in',
    'Arnav Katyal',
    'CSE',
    5,
    'Tech Head at GDG On Campus, Bennett University. Passionate about systems and open source.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'admin',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'priya.sharma@bennett.edu.in',
    'Priya Sharma',
    'CSE',
    3,
    '2nd year CSE student. Exploring Algorithms, Web Dev, and Competitive Programming.',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'student',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'rohit.verma@bennett.edu.in',
    'Rohit Verma',
    'ECE',
    3,
    'Embedded systems and IoT lead at the university robotics club.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'student',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'ananya.singh@bennett.edu.in',
    'Ananya Singh',
    'CSE',
    1,
    '1st year CSE student. Learning C programming and discrete mathematics.',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    'student',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'dev.patel@bennett.edu.in',
    'Dev Patel',
    'ME',
    5,
    'Mechanical engineering junior. CAD/CAM and racing vehicle design.',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'student',
    false
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Study Feed Posts
INSERT INTO public.posts (id, author_id, title, subject, branch, semester, type, description, link_url, upvote_count)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Complete Data Structures & Algorithms Hand-written Notes',
    'Data Structures',
    'CSE',
    3,
    'notes',
    'Comprehensive handwritten notes covering Trees, BST, AVL Rotations, Graph traversals, and Dijkstra with clean diagrams.',
    'https://github.com/Bennett-GDG/dsa-handwritten-notes',
    42
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Operating Systems End-Term Previous Year Questions (2023-2025)',
    'Operating Systems',
    'CSE',
    5,
    'PYQ',
    'Solved questions on CPU scheduling algorithms, Banker algorithm for deadlock avoidance, and virtual memory page replacement techniques.',
    'https://drive.google.com/file/d/placeholder-os-pyq/view',
    67
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'Digital Electronics Circuit Simulator & Cheatsheet',
    'Digital Logic Design',
    'ECE',
    3,
    'link',
    'Interactive online simulator for K-Maps, multiplexers, and flip-flop state transition diagrams. Extremely helpful before practical labs.',
    'https://circuitverse.org/simulator',
    28
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000004',
    'Linear Algebra & Differential Equations Mid-Term PYQs with Step Solutions',
    'Engineering Mathematics II',
    'CSE',
    1,
    'PYQ',
    'Eigenvalues, Cayley-Hamilton theorem, and homogeneous differential equation solutions compiled from the last 3 years.',
    'https://drive.google.com/file/d/placeholder-math-pyq/view',
    51
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000005',
    'SolidWorks & AutoCAD 3D Modelling Video Walkthrough for Workshop Labs',
    'Computer Aided Design',
    'ME',
    5,
    'video',
    'Step-by-step video tutorial demonstrating assembly modelling, constraint solving, and drawing generation for mechanical engineering submissions.',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    19
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Events
INSERT INTO public.events (id, title, club, date_time, venue, description, category)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'Hacktoberfest 2026: Open Source Kickoff & First PR Workshop',
    'GDG On Campus Bennett University',
    '2026-10-25T17:30:00Z',
    'Auditorium 1, Ground Floor',
    'Learn Git, GitHub, branching strategies, and how to submit your first open source contribution to Campus Buddy! Swag and certificates for active participants.',
    'Workshop'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Google Cloud & Generative AI Hands-on Lab',
    'GDG On Campus Bennett University',
    '2026-10-28T16:00:00Z',
    'Computer Lab 402, Block A',
    'Deploy machine learning pipelines and build multimodal web applications using Gemini APIs and Google Cloud Run. Hands-on coding session.',
    'Tech Talk'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'Autonomous Robotics & Microcontroller Showcase',
    'Robotics Society',
    '2026-11-02T15:00:00Z',
    'Student Activity Centre Hall B',
    'Live demonstration of line-follower robots, drone flight algorithms, and IoT sensors built by ECE and ME students.',
    'Club Activity'
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'Bennett Annual 24-Hour Hackathon 2026',
    'ACM Student Chapter',
    '2026-11-14T09:00:00Z',
    'Central Library Multi-purpose Hall',
    'Overnight hackathon with tracks in Healthcare, FinTech, Campus Utilities, and EdTech. Industry mentors and prize pool.',
    'Hackathon'
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Help Board
INSERT INTO public.help_requests (id, author_id, title, subject, description, tags, is_solved)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000004',
    'Segmentation fault in C linked list deletion function',
    'Programming in C',
    'I am trying to delete a node given a key in a singly linked list in C. My program compiles but segfaults whenever the key is at the head node. Can someone review my pointer traversal?',
    ARRAY['c', 'pointers', 'data-structures'],
    true
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    'How to resolve Git merge conflict with upstream main?',
    'Git & Open Source',
    'I forked Campus Buddy and made changes in my branch, but when attempting a git pull upstream main I get conflicts in package.json. What is the safest way to rebase cleanly without losing commits?',
    ARRAY['git', 'github', 'merge-conflict'],
    false
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Help Reply
INSERT INTO public.help_replies (id, request_id, author_id, message)
VALUES
  (
    '35000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'When deleting the head node, update the head pointer itself (*head_ref = temp->next; free(temp);). Check if you are passing Node** instead of Node*.'
  )
ON CONFLICT (id) DO NOTHING;

-- 6. Seed Chat Messages
INSERT INTO public.chat_messages (id, author_id, message)
VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Welcome everyone to Campus Buddy for Hacktoberfest 2026! Check out the issues tab on GitHub to grab your first issue.'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'Hey everyone, anyone working on the DSA notes filters issue? Happy to collaborate!'
  )
ON CONFLICT (id) DO NOTHING;
