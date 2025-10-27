'use client'

import { ReactNode, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  AppBar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
  Badge,
  alpha,
  Select,
  MenuItem,
  FormControl,
  Chip,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import PeopleIcon from '@mui/icons-material/People'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import ShieldIcon from '@mui/icons-material/Shield'

interface DashboardNavItem {
  id: string
  label: string
  icon: ReactNode
  path: string
  description: string
}

const navItems: DashboardNavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <DashboardIcon />,
    path: '/moderation',
    description: 'Dashboard statistics and overview'
  },
  {
    id: 'contests',
    label: 'Contests',
    icon: <VideoLibraryIcon />,
    path: '/moderation/contests',
    description: 'Create and manage contests'
  },
  {
    id: 'submissions',
    label: 'Submissions',
    icon: <VideoLibraryIcon />,
    path: '/moderation/submissions',
    description: 'Review and moderate video submissions'
  },
  {
    id: 'winners',
    label: 'Winners',
    icon: <EmojiEventsIcon />,
    path: '/moderation/winners',
    description: 'View and manage winner submissions'
  },
  {
    id: 'users',
    label: 'Users',
    icon: <PeopleIcon />,
    path: '/moderation/users',
    description: 'Manage user accounts and permissions'
  }
]

interface DashboardLayoutProps {
  children: ReactNode
}

const DRAWER_WIDTH = 280
const APP_BAR_HEIGHT = 64

interface DashboardLayoutProps {
  children: ReactNode
  selectedTab?: string
  onTabChange?: (tab: string) => void
  selectedContest?: string | null
  onContestChange?: (contestId: string | null) => void
  contestList?: any[]
}

function NavItem({ 
  item, 
  isActive, 
  onClick 
}: { 
  item: DashboardNavItem
  isActive: boolean
  onClick: () => void
}) {
  const theme = useTheme()
  
  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={onClick}
        selected={isActive}
        sx={{
          borderRadius: 2,
          mx: 1,
          mb: 0.5,
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '& .MuiListItemIcon-root': {
              color: 'white',
            },
          },
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          },
        }}
      >
        <ListItemIcon sx={{ color: isActive ? 'white' : 'text.secondary', minWidth: 40 }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText 
          primary={item.label}
          secondary={item.description}
          primaryTypographyProps={{
            fontWeight: isActive ? 700 : 500,
          }}
          secondaryTypographyProps={{
            fontSize: '0.75rem',
            color: isActive ? 'rgba(255,255,255,0.8)' : 'text.secondary',
          }}
        />
      </ListItemButton>
    </ListItem>
  )
}

export default function DashboardLayout({ children, selectedTab, onTabChange, selectedContest, onContestChange, contestList = [] }: DashboardLayoutProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  
  // Use selectedTab from props, or default to 'overview'
  const activeTab = selectedTab || 'overview'
  
  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId)
    }
  }
  
  const selectedContestTitle = selectedContest 
    ? contestList.find(c => c.id === selectedContest)?.title || 'Unknown'
    : null

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar - Fixed at top */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          height: APP_BAR_HEIGHT,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.3)}, transparent)`,
          },
        }}
      >
        <Toolbar 
          sx={{ 
            height: APP_BAR_HEIGHT,
            px: { xs: 2, md: 3 },
          }}
        >
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              color: 'text.primary',
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main',
                width: 32,
                height: 32,
              }}
            >
              <ShieldIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Moderation Dashboard
            </Typography>
          </Box>
          
          {/* Contest Selector */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 220,
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <Select
                value={selectedContest || 'all'}
                onChange={(e) => onContestChange?.(e.target.value === 'all' ? null : e.target.value)}
                displayEmpty
                sx={{
                  color: 'white',
                  '& .MuiSelect-icon': {
                    color: 'white',
                  },
                }}
              >
                <MenuItem value="all">
                  <Typography variant="body2">All Contests</Typography>
                </MenuItem>
                {contestList.map((contest) => (
                  <MenuItem key={contest.id} value={contest.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Box 
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: 1,
                          bgcolor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'white',
                          flexShrink: 0,
                        }}
                      >
                        {contest.display_number || '?'}
                      </Box>
                      <Typography variant="body2" sx={{ flex: 1 }}>{contest.title}</Typography>
                      <Chip 
                        label={contest.status} 
                        size="small"
                        sx={{
                          bgcolor: contest.status === 'ACTIVE' ? '#ef4444' : '#64748b',
                          color: 'white',
                          height: 18,
                          fontSize: '0.65rem',
                        }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(12px)',
            borderRight: `1px solid ${theme.palette.divider}`,
            mt: `${APP_BAR_HEIGHT}px`,
            height: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
            pt: 2,
          },
        }}
      >
        {/* Drawer Header for Mobile */}
        {isMobile && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, pb: 2 }}>
            <IconButton 
              onClick={() => setSidebarOpen(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        )}
        
        <Divider sx={{ mx: 2, mb: 1 }} />
        
        <Box sx={{ overflow: 'auto', px: 1 }}>
          <List>
            {navItems.map((item) => (
              <NavItem 
                key={item.id} 
                item={item}
                isActive={activeTab === item.id}
                onClick={() => handleTabClick(item.id)}
              />
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          mt: `${APP_BAR_HEIGHT}px`,
        }}
      >
        {/* Content Container */}
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: '1400px',
            width: '100%',
            mx: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}

